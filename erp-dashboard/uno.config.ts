import { defineConfig, presetUno, presetAttributify, presetIcons } from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify(), // optional — lets you use classless syntax like <div text="red" />
    presetIcons(),       // optional — icon support
  ],
})
