# build script for the web components
import { parse as parseBabel } from '@babel/parser'
import chokidar from 'chokidar'
import fs from 'fs/promises'
import { Window, HTMLElement } from 'happy-dom'
import path from 'path'
import * as pm from 'picomatch'

###*
# @typedef {{mod: any, file: string, ast: any}} Module
# @typedef {{module: Module, component: string, element: string, attrs: any}} Component
###

global.window = new Window()
global.document = window.document
global.HTMLElement = HTMLElement
global.customElements = window.customElements

debug = false

parse = (code, filepath) ->
  parseBabel code,
    sourceType: 'module'
    sourceFilename: filepath
    plugins: [
      'typescript'
      'jsx'
    ]
loadFiles = (dir, pred = -> true) ->
  files = []
  entries = await fs.readdir(dir, { withFileTypes: true })
  for entry in entries
    fullPath = path.join(dir, entry.name)
    if entry.isDirectory()
      files.push ...(await loadFiles(fullPath))
    else if entry.isFile() and pred(fullPath)
      files.push fullPath
  files

export buildMeta = ->
  modules = await getModules()
  components = getComponents modules
  await Promise.all [
    buildJsxTypes components
    buildVSCCustomData components
  ]
export buildJsxTypes = (components) ->
  dts  = "import type { ComponentAttributes } from './webcomp.js';\n"
  dts += "import type { #{comp.component} } from '#{comp.modpath}';\n" for comp in components
  dts += '\n'
  dts += [
    "declare namespace JSX {"
    "  interface IntrinsicElements {"
    ("    '#{comp.element}': ComponentAttributes<typeof #{comp.component}>;" for comp in components)...
    "  }"
    "}"
  ].join '\n'
  await fs.writeFile 'dist/index.d.ts', dts
export buildVSCCustomData = (components) ->
  # TODO: implement
  console.warn 'VSC custom data not yet implemented'

###*
# @returns {Module[]}
###
getModules = ->
  files = await loadFiles 'src/stories', (file) -> pm.isMatch file, '**/*.tsx'
  files = files.map (f) -> './' + f
  await Promise.all files.map (f) ->
    console.log "Processing #{f}" if debug
    mod = await import(f)
    ast = await parse await fs.readFile(f, 'utf8')
    return { mod, file: f, ast }

###*
# @param {Module[]} modules
# @returns {Component[]}
###
getComponents = (modules) ->
  components = []
  for mod in modules
    for expname of mod.mod
      meta = mod.mod[expname]
      continue unless typeof meta is 'object'
      continue unless typeof meta.Component is 'function'
      continue unless typeof meta.attrs is 'object'
      components.push
        module: mod
        component: expname
        element: meta.name
        attrs: meta.attrs
  components

if process.argv[1] is import.meta.filename
  debug = not process.argv.includes '-s'
  await buildMeta()
  if process.argv.includes '--dev'
    chokidar.watch('src/stories').on 'change', ->
      await buildMeta()
      console.log 'Built metadata'
    console.log 'Watching for changes in src/stories'
