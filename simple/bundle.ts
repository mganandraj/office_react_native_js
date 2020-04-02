const ANDROID_BUNDLE_OUTPUT = "lib/assets";
const ANDROID_ASSETS_MAVEN_OUTPUT = "lib/res";
const IOS_BUNDLE_OUTPUT = "lib";
const WIN32_LIB_OUTPUT_DIR = "lib";
const WINDOWS_LIB_OUTPUT_DIR = "lib";

type TargetPlatform =
  | "android"
  | "hermes"
  | "ios"
  | "macos"
  | "win32"
  | "windows"
  | "lpp-android"
  | "lpp-ios";

interface BundleArgs {
  packageRoot: string;
  tsProject: string;
  platform: TargetPlatform;
  bundleOutput: string;
  assetsDst: string;
  skipIfWatching: boolean;
  runPrereqs: boolean;
  options: string[];
}

interface Env {
  NODE_ENV?: "development" | "production";
  TEMP?: string;
  TMPDIR?: string;
}

// @types/fs-extra doesn't properly declare ensureDirSync, so we import it without type safety
const fs = require("fs-extra");
import * as hasha from "hasha";
import * as http from "http";
import * as path from "path";

import { sync as spawnSync } from "cross-spawn";

const projectRoot = spawnSync("git", ["rev-parse", "--show-toplevel"])
  .stdout.toString()
  .trim();
const isDev = true; //process.env.CONFIGURATION !== "Release";

const runPrereqsFlag = "--run-prereqs";
const skipIfWatchingFlag = "--skip-if-watching";

function defaultArgs(
  targetPlatform: TargetPlatform,
  options: string[]
): BundleArgs {
  const skipIfWatching = options.indexOf(skipIfWatchingFlag) >= 0;
  const runPrereqs = options.indexOf(runPrereqsFlag) >= 0;

  return {
    packageRoot: process.cwd(),
    tsProject: "tsconfig.json",
    platform: targetPlatform,
    bundleOutput: "lib/index.mobile.jsbundle",
    assetsDst: "lib/Resources",
    skipIfWatching,
    runPrereqs,
    options,
  };
}

//  name        friendly name of the bundle, used only for logging
//  platform    platform to use when generating the bundle: android, ios, macos, win32, windows
//  flavor      build flavor: dev, ship
//  outputPath  directory where the bundle is written and all assets are stored
//

function haulBundleWithSdx(options: {
  packageRoot: string;
  name: string;
  platform: TargetPlatform;
  flavor: "dev" | "ship";
  outputPath: string;
}): void {
  const sdxHaulBundle = require("@office-iss/sdx-build-tools/lib/utils/haul/haul-bundle")
    .haulBundle;
  process.chdir(options.packageRoot);
  sdxHaulBundle({ ...options, hideProgress: true });
}

const options = process.argv.slice(3);
const args = defaultArgs('android', options)

haulBundleWithSdx({
  packageRoot: args.packageRoot,
  name: path.basename(args.packageRoot),
  platform: "android",
  flavor: isDev ? "dev" : "ship",
  outputPath: ANDROID_BUNDLE_OUTPUT,
})
