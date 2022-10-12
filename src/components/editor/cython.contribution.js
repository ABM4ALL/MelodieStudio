/*!-----------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Version: 0.33.0(4b1abad427e58dbedc1215d99a0902ffc885fcd4)
 * Released under the MIT license
 * https://github.com/microsoft/monaco-editor/blob/main/LICENSE.txt
 *-----------------------------------------------------------------------------*/
/* eslint-disable */
// src/basic-languages/python/python.contribution.ts
import { registerLanguage } from "monaco-editor/esm/vs/basic-languages/_.contribution.js";
registerLanguage({
  id: "cython",
  extensions: [".pyx", ".pxd"],
  aliases: ["Cython", "cython"],
  firstLine: "^#!/.*\\bpython[0-9.-]*\\b",
  loader: () => {
    return import("./cython.js");
  }
});
