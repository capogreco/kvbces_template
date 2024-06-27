import { Signal, useSignal } from "@preact/signals"
import { useEffect } from "preact/hooks"

import { Grid, GridUpdate } from "../shared/types.ts"

import ColorPicker from "../components/ColorPicker.tsx"
import PixelGrid from "../components/PixelGrid.tsx"

function applyGameUpdates (signal: Signal<Grid>, updates: GridUpdate[]) {
   const grid = signal.value
   for (const update of updates) {
      if (grid.versionstamps[update.index] >= update.versionstamp) continue
      console.log (`applying update`, update.versionstamp)
      grid.tiles[update.index] = update.color
      grid.versionstamps[update.index] = update.versionstamp
      blip ()
   }
   signal.value = { ...grid }
}

let audio_ctx: AudioContext

function blip () {
   if (!audio_ctx || audio_ctx.state === `suspended`) return
   const osc = audio_ctx.createOscillator ()
   osc.type = `sine`
   osc.frequency.value = 440
   osc.connect (audio_ctx.destination)
   osc.start ()
   osc.stop (audio_ctx.currentTime + 0.1)
}

export default function SynthesisEngine(props: { 
      grid: Grid,
      enabled: boolean,
   }) {

   const selected = useSignal (0)
   const grid = useSignal (props.grid)
   const enabled = useSignal (props.enabled)

   const enable = async () => {
      await audio_ctx.resume ()
      enabled.value = true
      console.log (audio_ctx.state)
      console.log (`enabled`)
   }

   useEffect (() => {
      audio_ctx = new AudioContext ()
      audio_ctx.suspend ()
      enabled.value = false
     
      const eventSource = new EventSource(`/api/listen`)
      eventSource.onmessage = e => {
         const updates: GridUpdate[] = JSON.parse (e.data)
         applyGameUpdates (grid, updates)
      }
      return () => eventSource.close ()
   }, [])

   async function updateGrid (index: number, color: string) {
      const resp = await fetch(`/api/update`, {
         method: `POST`,
         headers: {
            "Content-Type": "application/json",
         },
         body: JSON.stringify ([index, color]),
      })
      if (!resp.ok) {
         console.error (`Failed to update grid`)
      }
      const versionstamp: string = await resp.json ()
      const update = { index, color, versionstamp }
      applyGameUpdates (grid, [update])
   }

   if (enabled.value) {
      return (
         <div class="flex flex-col gap-4">
            <PixelGrid grid={grid} selected={selected} updateGrid={updateGrid} />
            { audio_ctx.state }
         </div>
      )
   }
   else {
      return (
         <div 
            class="font-sans font-bold italic text-7xl text-white text-center justify-center items-center flex h-screen bg-black"
            onPointerDown={ enable }
         >
            → ENABLE
         </div>
      )   
   }
}
