package com.ehsanulkarimpappu.sortscope.model

enum class AlgorithmFamily(val label: String) {
    FOUNDATIONAL("Foundational"),
    DIVIDE_AND_CONQUER("Divide & conquer"),
    TREE_AND_GAP("Tree & gap"),
    HYBRID("Real-world hybrid"),
    DISTRIBUTION("Distribution"),
    NETWORK("Parallel network"),
}

enum class DatasetKind(val label: String) {
    RANDOM("Random"),
    NEARLY_SORTED("Nearly sorted"),
    REVERSED("Reversed"),
    FEW_UNIQUE("Few unique"),
    CUSTOM("Custom"),
}

enum class OperationKind {
    READY,
    COMPARE,
    SWAP,
    WRITE,
    CANDIDATE,
    PHASE,
    SORTED,
    COMPLETE,
}

data class SortItem(
    val id: Int,
    val value: Int,
    val identity: String = "",
)

data class Metrics(
    val comparisons: Int = 0,
    val writes: Int = 0,
    val swaps: Int = 0,
) {
    val work: Int get() = comparisons + writes
}

data class Decision(
    val left: Int,
    val operator: String,
    val right: Int,
    val result: Boolean,
) {
    val question: String get() = "Will $left $operator $right?"
}

data class SortStep(
    val items: List<SortItem>,
    val operation: OperationKind,
    val title: String,
    val message: String,
    val detail: String = "",
    val activeIds: Set<Int> = emptySet(),
    val candidateIds: Set<Int> = emptySet(),
    val sortedIds: Set<Int> = emptySet(),
    val codeLine: Int = 0,
    val metrics: Metrics = Metrics(),
    val decision: Decision? = null,
    val variables: Map<String, String> = emptyMap(),
)

data class SortTrace(
    val algorithmId: String,
    val source: List<SortItem>,
    val steps: List<SortStep>,
) {
    val result: List<SortItem> get() = steps.last().items
    val metrics: Metrics get() = steps.last().metrics
}

data class ComplexityInfo(
    val best: String,
    val average: String,
    val worst: String,
    val space: String,
)

data class AlgorithmDefinition(
    val id: String,
    val name: String,
    val shortName: String,
    val family: AlgorithmFamily,
    val description: String,
    val invariant: String,
    val complexity: ComplexityInfo,
    val stable: Boolean,
    val inPlace: Boolean,
    val accent: Int,
    val pseudocode: List<String>,
)
