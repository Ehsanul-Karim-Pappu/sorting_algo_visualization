package com.ehsanulkarimpappu.sortscope.ui

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.ehsanulkarimpappu.sortscope.data.AlgorithmCatalog
import com.ehsanulkarimpappu.sortscope.engine.Datasets
import com.ehsanulkarimpappu.sortscope.engine.SortEngine
import com.ehsanulkarimpappu.sortscope.model.AlgorithmDefinition
import com.ehsanulkarimpappu.sortscope.model.DatasetKind
import com.ehsanulkarimpappu.sortscope.model.Decision
import com.ehsanulkarimpappu.sortscope.model.SortStep
import com.ehsanulkarimpappu.sortscope.model.SortTrace
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

enum class AppSection(val label: String, val glyph: String) {
    EXPLORE("Explore", "◫"),
    VISUALIZE("Visualize", "▶"),
    LEARN("Learn", "◎"),
}

data class ComplexityPoint(
    val size: Int,
    val primaryWork: Int,
    val comparisonWork: Int? = null,
)

data class PendingPrediction(
    val decision: Decision,
    val stepIndex: Int,
)

data class SortScopeState(
    val section: AppSection,
    val algorithmId: String,
    val comparisonAlgorithmId: String,
    val dataset: DatasetKind,
    val size: Int,
    val seed: Int,
    val speed: Int,
    val sourceLabel: String,
    val trace: SortTrace,
    val comparisonTrace: SortTrace,
    val position: Int = 0,
    val playing: Boolean = false,
    val comparisonEnabled: Boolean = false,
    val predictionEnabled: Boolean = false,
    val pendingPrediction: PendingPrediction? = null,
    val predictionCorrect: Int = 0,
    val predictionTotal: Int = 0,
    val predictionStreak: Int = 0,
    val stabilityMode: Boolean = false,
    val completedAlgorithms: Set<String> = emptySet(),
    val customError: String? = null,
    val complexity: List<ComplexityPoint> = emptyList(),
    val complexityLoading: Boolean = false,
) {
    val algorithm: AlgorithmDefinition get() = AlgorithmCatalog.byId.getValue(algorithmId)
    val comparisonAlgorithm: AlgorithmDefinition get() = AlgorithmCatalog.byId.getValue(comparisonAlgorithmId)
    val maximum: Int get() = if (comparisonEnabled) {
        maxOf(trace.metrics.work, comparisonTrace.metrics.work)
    } else {
        trace.steps.lastIndex
    }
    val currentStep: SortStep get() = if (comparisonEnabled) trace.stepAtWork(position) else trace.steps[position.coerceIn(0, trace.steps.lastIndex)]
    val currentComparisonStep: SortStep get() = comparisonTrace.stepAtWork(position)
    val progress: Float get() = if (maximum == 0) 0f else position.toFloat() / maximum
    val isComplete: Boolean get() = position >= maximum
    val lessonProgress: Int get() = when {
        isComplete -> 3
        progress >= 0.5f -> 2
        position > 0 -> 1
        else -> 0
    }
    val stabilityPreserved: Boolean get() {
        val original = trace.source.groupBy { it.value }.mapValues { (_, values) -> values.map { it.id } }
        val result = trace.result.groupBy { it.value }.mapValues { (_, values) -> values.map { it.id } }
        return original == result
    }
}

class SortScopeViewModel(application: Application) : AndroidViewModel(application) {
    private val preferences = application.getSharedPreferences("sortscope", 0)
    private var playback: Job? = null

    private val initialAlgorithm = preferences.getString("algorithm", "bubble")
        ?.takeIf { AlgorithmCatalog.byId.containsKey(it) } ?: "bubble"
    private val initialDataset = preferences.getString("dataset", DatasetKind.RANDOM.name)
        ?.let { runCatching { DatasetKind.valueOf(it) }.getOrNull() } ?: DatasetKind.RANDOM
    private val initialSize = preferences.getInt("size", 12).coerceIn(6, 32)
    private val initialSeed = preferences.getInt("seed", 2026)
    private val completed = preferences.getStringSet("completed", emptySet()).orEmpty().toSet()
    private val initialSource = Datasets.generate(initialDataset, initialSize, initialSeed)

    private val _state = MutableStateFlow(
        SortScopeState(
            section = AppSection.VISUALIZE,
            algorithmId = initialAlgorithm,
            comparisonAlgorithmId = if (initialAlgorithm == "merge") "quick" else "merge",
            dataset = initialDataset,
            size = initialSize,
            seed = initialSeed,
            speed = preferences.getInt("speed", 52).coerceIn(1, 100),
            sourceLabel = initialDataset.label,
            trace = SortEngine.trace(initialAlgorithm, initialSource),
            comparisonTrace = SortEngine.trace(if (initialAlgorithm == "merge") "quick" else "merge", initialSource),
            completedAlgorithms = completed,
        ),
    )
    val state: StateFlow<SortScopeState> = _state.asStateFlow()

    fun selectSection(section: AppSection) = _state.update { it.copy(section = section) }

    fun selectAlgorithm(id: String) {
        if (id == _state.value.algorithmId || !AlgorithmCatalog.byId.containsKey(id)) return
        stopPlayback()
        val comparison = if (_state.value.comparisonAlgorithmId == id) {
            AlgorithmCatalog.algorithms.first { it.id != id }.id
        } else _state.value.comparisonAlgorithmId
        rebuild(algorithmId = id, comparisonId = comparison)
        preferences.edit().putString("algorithm", id).apply()
    }

    fun selectComparisonAlgorithm(id: String) {
        if (id == _state.value.algorithmId || !AlgorithmCatalog.byId.containsKey(id)) return
        stopPlayback()
        rebuild(comparisonId = id)
    }

    fun selectDataset(kind: DatasetKind) {
        if (kind == DatasetKind.CUSTOM) {
            _state.update { it.copy(dataset = kind, customError = null) }
            return
        }
        stopPlayback()
        rebuild(dataset = kind, source = Datasets.generate(kind, _state.value.size, _state.value.seed), sourceLabel = kind.label, stability = false)
        preferences.edit().putString("dataset", kind.name).apply()
    }

    fun setSize(size: Int) {
        val nextSize = size.coerceIn(6, 32)
        if (nextSize == _state.value.size) return
        stopPlayback()
        val kind = if (_state.value.dataset == DatasetKind.CUSTOM) DatasetKind.RANDOM else _state.value.dataset
        rebuild(size = nextSize, dataset = kind, source = Datasets.generate(kind, nextSize, _state.value.seed), sourceLabel = kind.label, stability = false)
        preferences.edit().putInt("size", nextSize).putString("dataset", kind.name).apply()
    }

    fun setSpeed(speed: Int) {
        val safe = speed.coerceIn(1, 100)
        _state.update { it.copy(speed = safe) }
        preferences.edit().putInt("speed", safe).apply()
    }

    fun newData() {
        stopPlayback()
        val seed = if (_state.value.seed == Int.MAX_VALUE) 1 else _state.value.seed + 1
        val kind = if (_state.value.dataset == DatasetKind.CUSTOM) DatasetKind.RANDOM else _state.value.dataset
        rebuild(seed = seed, dataset = kind, source = Datasets.generate(kind, _state.value.size, seed), sourceLabel = kind.label, stability = false)
        preferences.edit().putInt("seed", seed).putString("dataset", kind.name).apply()
    }

    fun applyCustom(raw: String): Boolean {
        val result = Datasets.custom(raw)
        result.onFailure { error -> _state.update { it.copy(customError = error.message ?: "Invalid values") } }
        result.onSuccess { source ->
            stopPlayback()
            rebuild(size = source.size, dataset = DatasetKind.CUSTOM, source = source, sourceLabel = "Custom array", stability = false)
        }
        return result.isSuccess
    }

    fun toggleStability() {
        stopPlayback()
        if (_state.value.stabilityMode) {
            val kind = DatasetKind.FEW_UNIQUE
            rebuild(dataset = kind, size = 12, source = Datasets.generate(kind, 12, _state.value.seed), sourceLabel = kind.label, stability = false)
        } else {
            val source = Datasets.stability()
            rebuild(dataset = DatasetKind.FEW_UNIQUE, size = source.size, source = source, sourceLabel = "Stability identities", stability = true)
        }
    }

    fun toggleComparison() {
        stopPlayback()
        _state.update { it.copy(comparisonEnabled = !it.comparisonEnabled, position = 0, pendingPrediction = null, predictionEnabled = false) }
    }

    fun togglePrediction() {
        if (_state.value.comparisonEnabled) return
        stopPlayback()
        _state.update { it.copy(predictionEnabled = !it.predictionEnabled, pendingPrediction = null) }
    }

    fun answerPrediction(answer: Boolean) {
        val pending = _state.value.pendingPrediction ?: return
        val correct = answer == pending.decision.result
        _state.update {
            it.copy(
                position = pending.stepIndex,
                pendingPrediction = null,
                predictionCorrect = it.predictionCorrect + if (correct) 1 else 0,
                predictionTotal = it.predictionTotal + 1,
                predictionStreak = if (correct) it.predictionStreak + 1 else 0,
            )
        }
    }

    fun previous() {
        stopPlayback()
        _state.update { it.copy(position = (it.position - 1).coerceAtLeast(0), pendingPrediction = null) }
    }

    fun next() {
        stopPlayback()
        advance()
    }

    fun restart() {
        stopPlayback()
        _state.update { it.copy(position = 0, pendingPrediction = null) }
    }

    fun seek(position: Int) {
        stopPlayback()
        _state.update { it.copy(position = position.coerceIn(0, it.maximum), pendingPrediction = null) }
    }

    fun togglePlayback() {
        if (_state.value.playing) {
            stopPlayback()
            return
        }
        if (_state.value.isComplete) _state.update { it.copy(position = 0) }
        _state.update { it.copy(playing = true, pendingPrediction = null) }
        playback = viewModelScope.launch {
            while (isActive && _state.value.playing && !_state.value.isComplete) {
                delay(playbackDelay(_state.value.speed))
                advance()
            }
            if (_state.value.isComplete) markCompleted()
            _state.update { it.copy(playing = false) }
        }
    }

    fun runComplexityExperiment() {
        if (_state.value.complexityLoading) return
        _state.update { it.copy(complexityLoading = true) }
        viewModelScope.launch {
            val snapshot = _state.value
            val result = withContext(Dispatchers.Default) {
                listOf(6, 12, 18, 24, 30).map { size ->
                    val kind = snapshot.dataset.takeUnless { it == DatasetKind.CUSTOM } ?: DatasetKind.RANDOM
                    val source = Datasets.generate(kind, size, snapshot.seed + size)
                    ComplexityPoint(
                        size = size,
                        primaryWork = SortEngine.trace(snapshot.algorithmId, source).metrics.work,
                        comparisonWork = snapshot.comparisonEnabled
                            .takeIf { it }
                            ?.let { SortEngine.trace(snapshot.comparisonAlgorithmId, source).metrics.work },
                    )
                }
            }
            _state.update { it.copy(complexity = result, complexityLoading = false) }
        }
    }

    private fun advance() {
        val snapshot = _state.value
        if (snapshot.isComplete) {
            markCompleted()
            _state.update { it.copy(playing = false) }
            return
        }
        if (snapshot.predictionEnabled && !snapshot.comparisonEnabled) {
            val nextIndex = snapshot.position + 1
            val decision = snapshot.trace.steps[nextIndex].decision
            if (decision != null) {
                _state.update { it.copy(playing = false, pendingPrediction = PendingPrediction(decision, nextIndex)) }
                return
            }
        }
        _state.update { it.copy(position = (it.position + 1).coerceAtMost(it.maximum)) }
        if (_state.value.isComplete) markCompleted()
    }

    private fun markCompleted() {
        val id = _state.value.algorithmId
        if (id in _state.value.completedAlgorithms) return
        val next = _state.value.completedAlgorithms + id
        _state.update { it.copy(completedAlgorithms = next) }
        preferences.edit().putStringSet("completed", next).apply()
    }

    private fun rebuild(
        algorithmId: String = _state.value.algorithmId,
        comparisonId: String = _state.value.comparisonAlgorithmId,
        dataset: DatasetKind = _state.value.dataset,
        size: Int = _state.value.size,
        seed: Int = _state.value.seed,
        source: List<com.ehsanulkarimpappu.sortscope.model.SortItem> = _state.value.trace.source,
        sourceLabel: String = _state.value.sourceLabel,
        stability: Boolean = _state.value.stabilityMode,
    ) {
        _state.update {
            it.copy(
                algorithmId = algorithmId,
                comparisonAlgorithmId = comparisonId,
                dataset = dataset,
                size = size,
                seed = seed,
                sourceLabel = sourceLabel,
                trace = SortEngine.trace(algorithmId, source),
                comparisonTrace = SortEngine.trace(comparisonId, source),
                position = 0,
                playing = false,
                pendingPrediction = null,
                stabilityMode = stability,
                customError = null,
                complexity = emptyList(),
            )
        }
    }

    private fun stopPlayback() {
        playback?.cancel()
        playback = null
        _state.update { it.copy(playing = false) }
    }

    private fun playbackDelay(speed: Int): Long = (960L - speed * 8L).coerceIn(90L, 900L)
}

private fun SortTrace.stepAtWork(work: Int): SortStep {
    if (work <= 0) return steps.first()
    return steps.lastOrNull { it.metrics.work <= work } ?: steps.first()
}
