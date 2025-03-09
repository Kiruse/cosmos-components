import { $ } from 'bun'
import chokidar from 'chokidar'
import path from 'path'
import * as pug from 'pug'

importmap = {}
buildImportmap = ->
  pkg = await Bun.file('package.json').json()
  deps = Object.keys pkg.dependencies
  importmap =
    imports: {
      Object.fromEntries(deps.map (dep) -> [dep, "https://esm.sh/#{dep}"])...
      'preact/jsx-runtime': 'https://esm.sh/preact/jsx-runtime'
    }
  console.log "Built importmap"

html = ""
buildHtml = ->
  try
    html = pug.renderFile('assets/index.pug', { importmap })
    console.log "Built html"
  catch err
    console.error "Build html failed:", err

buildSources = ->
  await $"bun run build"
    .then(-> console.log "Built sources")
    .catch((err) -> console.error "Build sources failed:", err)

await buildImportmap()
await Promise.all [
  buildHtml()
  buildSources()
]

chokidar.watch('assets/index.pug').on 'change', -> buildHtml()
chokidar.watch('package.json').on 'change', ->
  await buildImportmap()
  await buildHtml()
chokidar.watch('src/').on 'change', -> buildSources()

Bun.serve
  port: 8080
  fetch: (req) ->
    url = new URL req.url
    pathname = path.relative import.meta.dir, path.resolve url.pathname.slice 1
    if pathname.startsWith '..'
      return new Response 'Not found', status: 404

    file = Bun.file pathname

    if url.pathname is '/'
      return new Response html,
        headers:
          'Content-Type': 'text/html'
    else if await file.exists()
      return new Response file,
        headers:
          'Content-Type': file.type
    else
      return new Response 'Not found', status: 404
  websocket:
    open: (ws) ->
      console.log 'open'
    message: (ws, message) ->
      console.log message
    close: (ws) ->
      console.log 'close'
