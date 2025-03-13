# build script for the web components
# produces custom-elements.json schema as well as TypeScript types
# NOTE: every visitor will have a naked return statement because babel traverse
#       does not expect a return value, but coffeescript has implicit returns
import chokidar from 'chokidar'
import fs from 'fs/promises'
import { Window, HTMLElement } from 'happy-dom'
import path from 'path'
import * as pm from 'picomatch'

global.window = new Window()
global.document = window.document
global.HTMLElement = HTMLElement
global.customElements = window.customElements

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
  components = []
  files = await loadFiles 'src/stories', (file) -> pm.isMatch file, '**/*!(.stories).tsx'
  files = files.map (f) -> './' + f
  for file in files
    console.log "Processing #{file}"
    mod = await import(file)
    for expname of mod
      meta = mod[expname]
      continue unless typeof meta is 'object'
      continue unless typeof meta.Component is 'function'
      continue unless typeof meta.attrs is 'object'
      components.push
        modpath: file.replace('./src/', './').replace('.tsx', '.js')
        component: expname
        element: meta.name
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

if process.argv[1] is import.meta.filename
  await buildMeta()
  if process.argv.includes '--dev'
    chokidar.watch('src/stories').on 'change', ->
      await buildMeta()
      console.log 'Built metadata'
    console.log 'Watching for changes in src/stories'
