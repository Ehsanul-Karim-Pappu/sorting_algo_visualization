import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");

test("the Android edition is native, offline, and buildable", async () => {
  const [manifest, activity, engine, app, gradle, workflow] = await Promise.all([
    read("android-native/app/src/main/AndroidManifest.xml"),
    read("android-native/app/src/main/java/com/ehsanulkarimpappu/sortscope/MainActivity.kt"),
    read("android-native/app/src/main/java/com/ehsanulkarimpappu/sortscope/engine/SortEngine.kt"),
    read("android-native/app/src/main/java/com/ehsanulkarimpappu/sortscope/ui/SortScopeApp.kt"),
    read("android-native/app/build.gradle.kts"),
    read(".github/workflows/android-apk.yml"),
  ]);

  assert.doesNotMatch(manifest, /android\.permission\.INTERNET/);
  assert.doesNotMatch(`${activity}\n${app}`, /WebView|loadUrl|android_asset/);
  assert.match(activity, /setContent\s*\{/);
  assert.match(app, /ExploreScreen/);
  assert.match(app, /VisualizeScreen/);
  assert.match(app, /LearnScreen/);
  assert.match(gradle, /org\.jetbrains\.kotlin\.plugin\.compose/);
  assert.match(gradle, /minSdk\s*=\s*24/);
  assert.match(workflow, /assembleDebug/);

  const algorithms = [
    "bubble", "cocktail", "selection", "insertion", "merge", "quick", "quick-three",
    "heap", "shell", "timsort", "introsort", "counting", "radix", "bucket", "bitonic",
  ];
  algorithms.forEach((id) => assert.match(engine, new RegExp(`"${id.replace("-", "\\-")}"`)));
});

test("Android resources explicitly document the no-network contract", async () => {
  const [manifest, nativeReadme] = await Promise.all([
    read("android-native/app/src/main/AndroidManifest.xml"),
    read("android-native/README.md"),
  ]);
  assert.match(manifest, /Intentionally no INTERNET permission/);
  assert.match(nativeReadme, /completely offline/i);
  assert.match(nativeReadme, /no WebView/i);
});
