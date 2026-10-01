import {defineConfig} from 'vite';
export default defineConfig({base:'./',build:{assetsInlineLimit:Number.MAX_SAFE_INTEGER,cssCodeSplit:false,rollupOptions:{output:{inlineDynamicImports:true}}}});
