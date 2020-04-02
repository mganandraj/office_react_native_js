"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var ANDROID_BUNDLE_OUTPUT = "lib/assets";
var ANDROID_ASSETS_MAVEN_OUTPUT = "lib/res";
var IOS_BUNDLE_OUTPUT = "lib";
var WIN32_LIB_OUTPUT_DIR = "lib";
var WINDOWS_LIB_OUTPUT_DIR = "lib";
// @types/fs-extra doesn't properly declare ensureDirSync, so we import it without type safety
var fs = require("fs-extra");
var path = __importStar(require("path"));
var cross_spawn_1 = require("cross-spawn");
var projectRoot = cross_spawn_1.sync("git", ["rev-parse", "--show-toplevel"])
    .stdout.toString()
    .trim();
var isDev = true; //process.env.CONFIGURATION !== "Release";
var runPrereqsFlag = "--run-prereqs";
var skipIfWatchingFlag = "--skip-if-watching";
function defaultArgs(targetPlatform, options) {
    var skipIfWatching = options.indexOf(skipIfWatchingFlag) >= 0;
    var runPrereqs = options.indexOf(runPrereqsFlag) >= 0;
    return {
        packageRoot: process.cwd(),
        tsProject: "tsconfig.json",
        platform: targetPlatform,
        bundleOutput: "lib/index.mobile.jsbundle",
        assetsDst: "lib/Resources",
        skipIfWatching: skipIfWatching,
        runPrereqs: runPrereqs,
        options: options,
    };
}
//  name        friendly name of the bundle, used only for logging
//  platform    platform to use when generating the bundle: android, ios, macos, win32, windows
//  flavor      build flavor: dev, ship
//  outputPath  directory where the bundle is written and all assets are stored
//
function haulBundleWithSdx(options) {
    var sdxHaulBundle = require("@office-iss/sdx-build-tools/lib/utils/haul/haul-bundle")
        .haulBundle;
    process.chdir(options.packageRoot);
    sdxHaulBundle(__assign(__assign({}, options), { hideProgress: true }));
}
var options = process.argv.slice(3);
var args = defaultArgs('android', options);
haulBundleWithSdx({
    packageRoot: args.packageRoot,
    name: path.basename(args.packageRoot),
    platform: "android",
    flavor: isDev ? "dev" : "ship",
    outputPath: ANDROID_BUNDLE_OUTPUT,
});
