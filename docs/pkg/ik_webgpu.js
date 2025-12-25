let wasm;

function addToExternrefTable0(obj) {
    const idx = wasm.__externref_table_alloc();
    wasm.__wbindgen_externrefs.set(idx, obj);
    return idx;
}

const CLOSURE_DTORS = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(state => state.dtor(state.a, state.b));

function debugString(val) {
    // primitive types
    const type = typeof val;
    if (type == 'number' || type == 'boolean' || val == null) {
        return  `${val}`;
    }
    if (type == 'string') {
        return `"${val}"`;
    }
    if (type == 'symbol') {
        const description = val.description;
        if (description == null) {
            return 'Symbol';
        } else {
            return `Symbol(${description})`;
        }
    }
    if (type == 'function') {
        const name = val.name;
        if (typeof name == 'string' && name.length > 0) {
            return `Function(${name})`;
        } else {
            return 'Function';
        }
    }
    // objects
    if (Array.isArray(val)) {
        const length = val.length;
        let debug = '[';
        if (length > 0) {
            debug += debugString(val[0]);
        }
        for(let i = 1; i < length; i++) {
            debug += ', ' + debugString(val[i]);
        }
        debug += ']';
        return debug;
    }
    // Test for built-in
    const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
    let className;
    if (builtInMatches && builtInMatches.length > 1) {
        className = builtInMatches[1];
    } else {
        // Failed to match the standard '[object ClassName]'
        return toString.call(val);
    }
    if (className == 'Object') {
        // we're a user defined class or Object
        // JSON.stringify avoids problems with cycles, and is generally much
        // easier than looping through ownProperties of `val`.
        try {
            return 'Object(' + JSON.stringify(val) + ')';
        } catch (_) {
            return 'Object';
        }
    }
    // errors
    if (val instanceof Error) {
        return `${val.name}: ${val.message}\n${val.stack}`;
    }
    // TODO we could test for more things here, like `Set`s and `Map`s.
    return className;
}

function getArrayU32FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getUint32ArrayMemory0().subarray(ptr / 4, ptr / 4 + len);
}

function getArrayU8FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getUint8ArrayMemory0().subarray(ptr / 1, ptr / 1 + len);
}

let cachedDataViewMemory0 = null;
function getDataViewMemory0() {
    if (cachedDataViewMemory0 === null || cachedDataViewMemory0.buffer.detached === true || (cachedDataViewMemory0.buffer.detached === undefined && cachedDataViewMemory0.buffer !== wasm.memory.buffer)) {
        cachedDataViewMemory0 = new DataView(wasm.memory.buffer);
    }
    return cachedDataViewMemory0;
}

function getStringFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return decodeText(ptr, len);
}

let cachedUint32ArrayMemory0 = null;
function getUint32ArrayMemory0() {
    if (cachedUint32ArrayMemory0 === null || cachedUint32ArrayMemory0.byteLength === 0) {
        cachedUint32ArrayMemory0 = new Uint32Array(wasm.memory.buffer);
    }
    return cachedUint32ArrayMemory0;
}

let cachedUint8ArrayMemory0 = null;
function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
        cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
}

function handleError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        const idx = addToExternrefTable0(e);
        wasm.__wbindgen_exn_store(idx);
    }
}

function isLikeNone(x) {
    return x === undefined || x === null;
}

function makeMutClosure(arg0, arg1, dtor, f) {
    const state = { a: arg0, b: arg1, cnt: 1, dtor };
    const real = (...args) => {

        // First up with a closure we increment the internal reference
        // count. This ensures that the Rust closure environment won't
        // be deallocated while we're invoking it.
        state.cnt++;
        const a = state.a;
        state.a = 0;
        try {
            return f(a, state.b, ...args);
        } finally {
            state.a = a;
            real._wbg_cb_unref();
        }
    };
    real._wbg_cb_unref = () => {
        if (--state.cnt === 0) {
            state.dtor(state.a, state.b);
            state.a = 0;
            CLOSURE_DTORS.unregister(state);
        }
    };
    CLOSURE_DTORS.register(real, state, state);
    return real;
}

function passStringToWasm0(arg, malloc, realloc) {
    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length, 1) >>> 0;
        getUint8ArrayMemory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;

    const mem = getUint8ArrayMemory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }
    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
        const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
        const ret = cachedTextEncoder.encodeInto(arg, view);

        offset += ret.written;
        ptr = realloc(ptr, len, offset, 1) >>> 0;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
cachedTextDecoder.decode();
const MAX_SAFARI_DECODE_BYTES = 2146435072;
let numBytesDecoded = 0;
function decodeText(ptr, len) {
    numBytesDecoded += len;
    if (numBytesDecoded >= MAX_SAFARI_DECODE_BYTES) {
        cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
        cachedTextDecoder.decode();
        numBytesDecoded = len;
    }
    return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}

const cachedTextEncoder = new TextEncoder();

if (!('encodeInto' in cachedTextEncoder)) {
    cachedTextEncoder.encodeInto = function (arg, view) {
        const buf = cachedTextEncoder.encode(arg);
        view.set(buf);
        return {
            read: arg.length,
            written: buf.length
        };
    }
}

let WASM_VECTOR_LEN = 0;

function wasm_bindgen__convert__closures_____invoke__h2158eb8bd813e32f(arg0, arg1, arg2) {
    wasm.wasm_bindgen__convert__closures_____invoke__h2158eb8bd813e32f(arg0, arg1, arg2);
}

function wasm_bindgen__convert__closures_____invoke__h07d73f73f4fdf0a1(arg0, arg1, arg2, arg3) {
    wasm.wasm_bindgen__convert__closures_____invoke__h07d73f73f4fdf0a1(arg0, arg1, arg2, arg3);
}

function wasm_bindgen__convert__closures_____invoke__h686082b566de68ab(arg0, arg1) {
    wasm.wasm_bindgen__convert__closures_____invoke__h686082b566de68ab(arg0, arg1);
}

function wasm_bindgen__convert__closures_____invoke__hcb8cfa4477b9920e(arg0, arg1, arg2) {
    wasm.wasm_bindgen__convert__closures_____invoke__hcb8cfa4477b9920e(arg0, arg1, arg2);
}

const __wbindgen_enum_GpuBlendFactor = ["zero", "one", "src", "one-minus-src", "src-alpha", "one-minus-src-alpha", "dst", "one-minus-dst", "dst-alpha", "one-minus-dst-alpha", "src-alpha-saturated", "constant", "one-minus-constant", "src1", "one-minus-src1", "src1-alpha", "one-minus-src1-alpha"];

const __wbindgen_enum_GpuBlendOperation = ["add", "subtract", "reverse-subtract", "min", "max"];

const __wbindgen_enum_GpuBufferBindingType = ["uniform", "storage", "read-only-storage"];

const __wbindgen_enum_GpuCanvasAlphaMode = ["opaque", "premultiplied"];

const __wbindgen_enum_GpuCompareFunction = ["never", "less", "equal", "less-equal", "greater", "not-equal", "greater-equal", "always"];

const __wbindgen_enum_GpuCullMode = ["none", "front", "back"];

const __wbindgen_enum_GpuFrontFace = ["ccw", "cw"];

const __wbindgen_enum_GpuIndexFormat = ["uint16", "uint32"];

const __wbindgen_enum_GpuLoadOp = ["load", "clear"];

const __wbindgen_enum_GpuPowerPreference = ["low-power", "high-performance"];

const __wbindgen_enum_GpuPrimitiveTopology = ["point-list", "line-list", "line-strip", "triangle-list", "triangle-strip"];

const __wbindgen_enum_GpuSamplerBindingType = ["filtering", "non-filtering", "comparison"];

const __wbindgen_enum_GpuStencilOperation = ["keep", "zero", "replace", "invert", "increment-clamp", "decrement-clamp", "increment-wrap", "decrement-wrap"];

const __wbindgen_enum_GpuStorageTextureAccess = ["write-only", "read-only", "read-write"];

const __wbindgen_enum_GpuStoreOp = ["store", "discard"];

const __wbindgen_enum_GpuTextureAspect = ["all", "stencil-only", "depth-only"];

const __wbindgen_enum_GpuTextureDimension = ["1d", "2d", "3d"];

const __wbindgen_enum_GpuTextureFormat = ["r8unorm", "r8snorm", "r8uint", "r8sint", "r16uint", "r16sint", "r16float", "rg8unorm", "rg8snorm", "rg8uint", "rg8sint", "r32uint", "r32sint", "r32float", "rg16uint", "rg16sint", "rg16float", "rgba8unorm", "rgba8unorm-srgb", "rgba8snorm", "rgba8uint", "rgba8sint", "bgra8unorm", "bgra8unorm-srgb", "rgb9e5ufloat", "rgb10a2uint", "rgb10a2unorm", "rg11b10ufloat", "rg32uint", "rg32sint", "rg32float", "rgba16uint", "rgba16sint", "rgba16float", "rgba32uint", "rgba32sint", "rgba32float", "stencil8", "depth16unorm", "depth24plus", "depth24plus-stencil8", "depth32float", "depth32float-stencil8", "bc1-rgba-unorm", "bc1-rgba-unorm-srgb", "bc2-rgba-unorm", "bc2-rgba-unorm-srgb", "bc3-rgba-unorm", "bc3-rgba-unorm-srgb", "bc4-r-unorm", "bc4-r-snorm", "bc5-rg-unorm", "bc5-rg-snorm", "bc6h-rgb-ufloat", "bc6h-rgb-float", "bc7-rgba-unorm", "bc7-rgba-unorm-srgb", "etc2-rgb8unorm", "etc2-rgb8unorm-srgb", "etc2-rgb8a1unorm", "etc2-rgb8a1unorm-srgb", "etc2-rgba8unorm", "etc2-rgba8unorm-srgb", "eac-r11unorm", "eac-r11snorm", "eac-rg11unorm", "eac-rg11snorm", "astc-4x4-unorm", "astc-4x4-unorm-srgb", "astc-5x4-unorm", "astc-5x4-unorm-srgb", "astc-5x5-unorm", "astc-5x5-unorm-srgb", "astc-6x5-unorm", "astc-6x5-unorm-srgb", "astc-6x6-unorm", "astc-6x6-unorm-srgb", "astc-8x5-unorm", "astc-8x5-unorm-srgb", "astc-8x6-unorm", "astc-8x6-unorm-srgb", "astc-8x8-unorm", "astc-8x8-unorm-srgb", "astc-10x5-unorm", "astc-10x5-unorm-srgb", "astc-10x6-unorm", "astc-10x6-unorm-srgb", "astc-10x8-unorm", "astc-10x8-unorm-srgb", "astc-10x10-unorm", "astc-10x10-unorm-srgb", "astc-12x10-unorm", "astc-12x10-unorm-srgb", "astc-12x12-unorm", "astc-12x12-unorm-srgb"];

const __wbindgen_enum_GpuTextureSampleType = ["float", "unfilterable-float", "depth", "sint", "uint"];

const __wbindgen_enum_GpuTextureViewDimension = ["1d", "2d", "2d-array", "cube", "cube-array", "3d"];

const __wbindgen_enum_GpuVertexFormat = ["uint8", "uint8x2", "uint8x4", "sint8", "sint8x2", "sint8x4", "unorm8", "unorm8x2", "unorm8x4", "snorm8", "snorm8x2", "snorm8x4", "uint16", "uint16x2", "uint16x4", "sint16", "sint16x2", "sint16x4", "unorm16", "unorm16x2", "unorm16x4", "snorm16", "snorm16x2", "snorm16x4", "float16", "float16x2", "float16x4", "float32", "float32x2", "float32x3", "float32x4", "uint32", "uint32x2", "uint32x3", "uint32x4", "sint32", "sint32x2", "sint32x3", "sint32x4", "unorm10-10-10-2", "unorm8x4-bgra"];

const __wbindgen_enum_GpuVertexStepMode = ["vertex", "instance"];

const __wbindgen_enum_ResizeObserverBoxOptions = ["border-box", "content-box", "device-pixel-content-box"];

const __wbindgen_enum_VisibilityState = ["hidden", "visible"];

export function main() {
    wasm.main();
}

const EXPECTED_RESPONSE_TYPES = new Set(['basic', 'cors', 'default']);

async function __wbg_load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);
            } catch (e) {
                const validResponse = module.ok && EXPECTED_RESPONSE_TYPES.has(module.type);

                if (validResponse && module.headers.get('Content-Type') !== 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else {
                    throw e;
                }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);
    } else {
        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };
        } else {
            return instance;
        }
    }
}

function __wbg_get_imports() {
    const imports = {};
    imports.wbg = {};
    imports.wbg.__wbg_Window_2b9b35492d4b2d63 = function(arg0) {
        const ret = arg0.Window;
        return ret;
    };
    imports.wbg.__wbg_Window_d1bf622f71ff0629 = function(arg0) {
        const ret = arg0.Window;
        return ret;
    };
    imports.wbg.__wbg_WorkerGlobalScope_b4fb13f0ba6527ab = function(arg0) {
        const ret = arg0.WorkerGlobalScope;
        return ret;
    };
    imports.wbg.__wbg___wbindgen_debug_string_adfb662ae34724b6 = function(arg0, arg1) {
        const ret = debugString(arg1);
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbg___wbindgen_is_function_8d400b8b1af978cd = function(arg0) {
        const ret = typeof(arg0) === 'function';
        return ret;
    };
    imports.wbg.__wbg___wbindgen_is_null_dfda7d66506c95b5 = function(arg0) {
        const ret = arg0 === null;
        return ret;
    };
    imports.wbg.__wbg___wbindgen_is_undefined_f6b95eab589e0269 = function(arg0) {
        const ret = arg0 === undefined;
        return ret;
    };
    imports.wbg.__wbg___wbindgen_throw_dd24417ed36fc46e = function(arg0, arg1) {
        throw new Error(getStringFromWasm0(arg0, arg1));
    };
    imports.wbg.__wbg__wbg_cb_unref_87dfb5aaa0cbcea7 = function(arg0) {
        arg0._wbg_cb_unref();
    };
    imports.wbg.__wbg_abort_07646c894ebbf2bd = function(arg0) {
        arg0.abort();
    };
    imports.wbg.__wbg_activeElement_b3e6b135325e4d5f = function(arg0) {
        const ret = arg0.activeElement;
        return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
    };
    imports.wbg.__wbg_addEventListener_6a82629b3d430a48 = function() { return handleError(function (arg0, arg1, arg2, arg3) {
        arg0.addEventListener(getStringFromWasm0(arg1, arg2), arg3);
    }, arguments) };
    imports.wbg.__wbg_addListener_32ac5b9ed9d2a521 = function() { return handleError(function (arg0, arg1) {
        arg0.addListener(arg1);
    }, arguments) };
    imports.wbg.__wbg_altKey_56d1d642f3a28c92 = function(arg0) {
        const ret = arg0.altKey;
        return ret;
    };
    imports.wbg.__wbg_altKey_e13fae92dfebca3e = function(arg0) {
        const ret = arg0.altKey;
        return ret;
    };
    imports.wbg.__wbg_animate_6ec571f163cf6f8d = function(arg0, arg1, arg2) {
        const ret = arg0.animate(arg1, arg2);
        return ret;
    };
    imports.wbg.__wbg_appendChild_7465eba84213c75f = function() { return handleError(function (arg0, arg1) {
        const ret = arg0.appendChild(arg1);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_beginRenderPass_f36cfdd5825e0c2e = function() { return handleError(function (arg0, arg1) {
        const ret = arg0.beginRenderPass(arg1);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_blockSize_6456aaf09f0ab287 = function(arg0) {
        const ret = arg0.blockSize;
        return ret;
    };
    imports.wbg.__wbg_body_544738f8b03aef13 = function(arg0) {
        const ret = arg0.body;
        return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
    };
    imports.wbg.__wbg_brand_9562792cbb4735c3 = function(arg0, arg1) {
        const ret = arg1.brand;
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbg_brands_a1e7a2bce052128f = function(arg0) {
        const ret = arg0.brands;
        return ret;
    };
    imports.wbg.__wbg_buffer_6cb2fecb1f253d71 = function(arg0) {
        const ret = arg0.buffer;
        return ret;
    };
    imports.wbg.__wbg_button_a54acd25bab5d442 = function(arg0) {
        const ret = arg0.button;
        return ret;
    };
    imports.wbg.__wbg_buttons_a37ff9ffacadddb5 = function(arg0) {
        const ret = arg0.buttons;
        return ret;
    };
    imports.wbg.__wbg_call_abb4ff46ce38be40 = function() { return handleError(function (arg0, arg1) {
        const ret = arg0.call(arg1);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_cancelAnimationFrame_1c2a3faf7be5aedd = function() { return handleError(function (arg0, arg1) {
        arg0.cancelAnimationFrame(arg1);
    }, arguments) };
    imports.wbg.__wbg_cancelIdleCallback_ee06eb3dcf335b86 = function(arg0, arg1) {
        arg0.cancelIdleCallback(arg1 >>> 0);
    };
    imports.wbg.__wbg_cancel_09c394f0894744eb = function(arg0) {
        arg0.cancel();
    };
    imports.wbg.__wbg_catch_b9db41d97d42bd02 = function(arg0, arg1) {
        const ret = arg0.catch(arg1);
        return ret;
    };
    imports.wbg.__wbg_clearTimeout_1ca823b279705d35 = function(arg0, arg1) {
        arg0.clearTimeout(arg1);
    };
    imports.wbg.__wbg_close_8158530fc398ee2f = function(arg0) {
        arg0.close();
    };
    imports.wbg.__wbg_code_b3ddfa90f724c486 = function(arg0, arg1) {
        const ret = arg1.code;
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbg_configure_ad5aa321838c8e3b = function() { return handleError(function (arg0, arg1) {
        arg0.configure(arg1);
    }, arguments) };
    imports.wbg.__wbg_contains_457d2fc195838bfa = function(arg0, arg1) {
        const ret = arg0.contains(arg1);
        return ret;
    };
    imports.wbg.__wbg_contentRect_1806147dfdc380d8 = function(arg0) {
        const ret = arg0.contentRect;
        return ret;
    };
    imports.wbg.__wbg_createBindGroupLayout_b87a1f26ed22bd5d = function() { return handleError(function (arg0, arg1) {
        const ret = arg0.createBindGroupLayout(arg1);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_createBindGroup_dfdadbbcf4dcae54 = function(arg0, arg1) {
        const ret = arg0.createBindGroup(arg1);
        return ret;
    };
    imports.wbg.__wbg_createBuffer_fb1752eab5cb2a7f = function() { return handleError(function (arg0, arg1) {
        const ret = arg0.createBuffer(arg1);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_createCommandEncoder_92b1c283a0372974 = function(arg0, arg1) {
        const ret = arg0.createCommandEncoder(arg1);
        return ret;
    };
    imports.wbg.__wbg_createElement_da4ed2b219560fc6 = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = arg0.createElement(getStringFromWasm0(arg1, arg2));
        return ret;
    }, arguments) };
    imports.wbg.__wbg_createObjectURL_7d9f7f8f41373850 = function() { return handleError(function (arg0, arg1) {
        const ret = URL.createObjectURL(arg1);
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    }, arguments) };
    imports.wbg.__wbg_createPipelineLayout_c97169a1a177450e = function(arg0, arg1) {
        const ret = arg0.createPipelineLayout(arg1);
        return ret;
    };
    imports.wbg.__wbg_createRenderPipeline_ab453ccc40539bc0 = function() { return handleError(function (arg0, arg1) {
        const ret = arg0.createRenderPipeline(arg1);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_createShaderModule_159013272c1b4c4c = function(arg0, arg1) {
        const ret = arg0.createShaderModule(arg1);
        return ret;
    };
    imports.wbg.__wbg_createTexture_092a9cf5106b1805 = function() { return handleError(function (arg0, arg1) {
        const ret = arg0.createTexture(arg1);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_createView_e743725c577bafe5 = function() { return handleError(function (arg0, arg1) {
        const ret = arg0.createView(arg1);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_ctrlKey_487597b9069da036 = function(arg0) {
        const ret = arg0.ctrlKey;
        return ret;
    };
    imports.wbg.__wbg_ctrlKey_b391e5105c3f6e76 = function(arg0) {
        const ret = arg0.ctrlKey;
        return ret;
    };
    imports.wbg.__wbg_debug_9d0c87ddda3dc485 = function(arg0) {
        console.debug(arg0);
    };
    imports.wbg.__wbg_deltaMode_d74ec093e23ffeec = function(arg0) {
        const ret = arg0.deltaMode;
        return ret;
    };
    imports.wbg.__wbg_deltaX_41f7678c94b10355 = function(arg0) {
        const ret = arg0.deltaX;
        return ret;
    };
    imports.wbg.__wbg_deltaY_3f10fd796fae2a0f = function(arg0) {
        const ret = arg0.deltaY;
        return ret;
    };
    imports.wbg.__wbg_devicePixelContentBoxSize_4312b643ce19dcae = function(arg0) {
        const ret = arg0.devicePixelContentBoxSize;
        return ret;
    };
    imports.wbg.__wbg_devicePixelRatio_390dee26c70aa30f = function(arg0) {
        const ret = arg0.devicePixelRatio;
        return ret;
    };
    imports.wbg.__wbg_disconnect_0078fed2ab427a04 = function(arg0) {
        arg0.disconnect();
    };
    imports.wbg.__wbg_disconnect_94d44092a36f9880 = function(arg0) {
        arg0.disconnect();
    };
    imports.wbg.__wbg_document_5b745e82ba551ca5 = function(arg0) {
        const ret = arg0.document;
        return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
    };
    imports.wbg.__wbg_drawIndexed_bf8f6537c7ff1b95 = function(arg0, arg1, arg2, arg3, arg4, arg5) {
        arg0.drawIndexed(arg1 >>> 0, arg2 >>> 0, arg3 >>> 0, arg4, arg5 >>> 0);
    };
    imports.wbg.__wbg_end_7ad26f2083234d67 = function(arg0) {
        arg0.end();
    };
    imports.wbg.__wbg_error_7534b8e9a36f1ab4 = function(arg0, arg1) {
        let deferred0_0;
        let deferred0_1;
        try {
            deferred0_0 = arg0;
            deferred0_1 = arg1;
            console.error(getStringFromWasm0(arg0, arg1));
        } finally {
            wasm.__wbindgen_free(deferred0_0, deferred0_1, 1);
        }
    };
    imports.wbg.__wbg_error_7bc7d576a6aaf855 = function(arg0) {
        console.error(arg0);
    };
    imports.wbg.__wbg_error_d7f117185d9ffd19 = function(arg0, arg1) {
        console.error(arg0, arg1);
    };
    imports.wbg.__wbg_finish_ac8e8f8408208d93 = function(arg0) {
        const ret = arg0.finish();
        return ret;
    };
    imports.wbg.__wbg_finish_b79779da004ef346 = function(arg0, arg1) {
        const ret = arg0.finish(arg1);
        return ret;
    };
    imports.wbg.__wbg_focus_220a53e22147dc0f = function() { return handleError(function (arg0) {
        arg0.focus();
    }, arguments) };
    imports.wbg.__wbg_fullscreenElement_e2e939644adf50e1 = function(arg0) {
        const ret = arg0.fullscreenElement;
        return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
    };
    imports.wbg.__wbg_getCoalescedEvents_21492912fd0145ec = function(arg0) {
        const ret = arg0.getCoalescedEvents;
        return ret;
    };
    imports.wbg.__wbg_getCoalescedEvents_43b8965761bb13ef = function(arg0) {
        const ret = arg0.getCoalescedEvents();
        return ret;
    };
    imports.wbg.__wbg_getComputedStyle_bbcd5e3d08077b71 = function() { return handleError(function (arg0, arg1) {
        const ret = arg0.getComputedStyle(arg1);
        return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
    }, arguments) };
    imports.wbg.__wbg_getContext_01f42b234e833f0a = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = arg0.getContext(getStringFromWasm0(arg1, arg2));
        return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
    }, arguments) };
    imports.wbg.__wbg_getContext_2f210d0a58d43d95 = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = arg0.getContext(getStringFromWasm0(arg1, arg2));
        return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
    }, arguments) };
    imports.wbg.__wbg_getCurrentTexture_3c8710ca6e0019fc = function() { return handleError(function (arg0) {
        const ret = arg0.getCurrentTexture();
        return ret;
    }, arguments) };
    imports.wbg.__wbg_getElementById_e05488d2143c2b21 = function(arg0, arg1, arg2) {
        const ret = arg0.getElementById(getStringFromWasm0(arg1, arg2));
        return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
    };
    imports.wbg.__wbg_getMappedRange_86d4a434bceeb7fc = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = arg0.getMappedRange(arg1, arg2);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_getOwnPropertyDescriptor_b6aa5a2fa50d52c7 = function(arg0, arg1) {
        const ret = Object.getOwnPropertyDescriptor(arg0, arg1);
        return ret;
    };
    imports.wbg.__wbg_getPreferredCanvasFormat_0988752050c788b0 = function(arg0) {
        const ret = arg0.getPreferredCanvasFormat();
        return (__wbindgen_enum_GpuTextureFormat.indexOf(ret) + 1 || 96) - 1;
    };
    imports.wbg.__wbg_getPropertyValue_dcded91357966805 = function() { return handleError(function (arg0, arg1, arg2, arg3) {
        const ret = arg1.getPropertyValue(getStringFromWasm0(arg2, arg3));
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    }, arguments) };
    imports.wbg.__wbg_get_6b7bd52aca3f9671 = function(arg0, arg1) {
        const ret = arg0[arg1 >>> 0];
        return ret;
    };
    imports.wbg.__wbg_get_c53d381635aa3929 = function(arg0, arg1) {
        const ret = arg0[arg1 >>> 0];
        return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
    };
    imports.wbg.__wbg_gpu_051bdce6489ddf6a = function(arg0) {
        const ret = arg0.gpu;
        return ret;
    };
    imports.wbg.__wbg_height_5d22b94a936fae9f = function(arg0) {
        const ret = arg0.height;
        return ret;
    };
    imports.wbg.__wbg_height_a07787f693c253d2 = function(arg0) {
        const ret = arg0.height;
        return ret;
    };
    imports.wbg.__wbg_info_ce6bcc489c22f6f0 = function(arg0) {
        console.info(arg0);
    };
    imports.wbg.__wbg_inlineSize_65c8cd0ecc54c605 = function(arg0) {
        const ret = arg0.inlineSize;
        return ret;
    };
    imports.wbg.__wbg_instanceof_GpuAdapter_aff4b0f95a6c1c3e = function(arg0) {
        let result;
        try {
            result = arg0 instanceof GPUAdapter;
        } catch (_) {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_instanceof_GpuCanvasContext_dc8dc7061b962990 = function(arg0) {
        let result;
        try {
            result = arg0 instanceof GPUCanvasContext;
        } catch (_) {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_instanceof_HtmlCanvasElement_c4251b1b6a15edcc = function(arg0) {
        let result;
        try {
            result = arg0 instanceof HTMLCanvasElement;
        } catch (_) {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_instanceof_Window_b5cf7783caa68180 = function(arg0) {
        let result;
        try {
            result = arg0 instanceof Window;
        } catch (_) {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_isIntersecting_2d00a342ea420fb9 = function(arg0) {
        const ret = arg0.isIntersecting;
        return ret;
    };
    imports.wbg.__wbg_is_928aa29d71e75457 = function(arg0, arg1) {
        const ret = Object.is(arg0, arg1);
        return ret;
    };
    imports.wbg.__wbg_key_505d33c50799526a = function(arg0, arg1) {
        const ret = arg1.key;
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbg_label_c3a930571192f18e = function(arg0, arg1) {
        const ret = arg1.label;
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbg_length_22ac23eaec9d8053 = function(arg0) {
        const ret = arg0.length;
        return ret;
    };
    imports.wbg.__wbg_length_d45040a40c570362 = function(arg0) {
        const ret = arg0.length;
        return ret;
    };
    imports.wbg.__wbg_limits_12dd06e895d48466 = function(arg0) {
        const ret = arg0.limits;
        return ret;
    };
    imports.wbg.__wbg_location_0ef648bbeb3e599c = function(arg0) {
        const ret = arg0.location;
        return ret;
    };
    imports.wbg.__wbg_log_1d990106d99dacb7 = function(arg0) {
        console.log(arg0);
    };
    imports.wbg.__wbg_matchMedia_29904c79dbaba90b = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = arg0.matchMedia(getStringFromWasm0(arg1, arg2));
        return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
    }, arguments) };
    imports.wbg.__wbg_matches_9cef9b7c722bd7c8 = function(arg0) {
        const ret = arg0.matches;
        return ret;
    };
    imports.wbg.__wbg_maxBindGroups_060f2b40f8a292b1 = function(arg0) {
        const ret = arg0.maxBindGroups;
        return ret;
    };
    imports.wbg.__wbg_maxBindingsPerBindGroup_3e4b03bbed2da128 = function(arg0) {
        const ret = arg0.maxBindingsPerBindGroup;
        return ret;
    };
    imports.wbg.__wbg_maxBufferSize_deda0fa7852420cb = function(arg0) {
        const ret = arg0.maxBufferSize;
        return ret;
    };
    imports.wbg.__wbg_maxColorAttachmentBytesPerSample_4a4a0e04d76eaf2a = function(arg0) {
        const ret = arg0.maxColorAttachmentBytesPerSample;
        return ret;
    };
    imports.wbg.__wbg_maxColorAttachments_db4883eeb9e8aeae = function(arg0) {
        const ret = arg0.maxColorAttachments;
        return ret;
    };
    imports.wbg.__wbg_maxComputeInvocationsPerWorkgroup_d050c461ebc92998 = function(arg0) {
        const ret = arg0.maxComputeInvocationsPerWorkgroup;
        return ret;
    };
    imports.wbg.__wbg_maxComputeWorkgroupSizeX_48153a1b779879ad = function(arg0) {
        const ret = arg0.maxComputeWorkgroupSizeX;
        return ret;
    };
    imports.wbg.__wbg_maxComputeWorkgroupSizeY_7f73d3d16fdea180 = function(arg0) {
        const ret = arg0.maxComputeWorkgroupSizeY;
        return ret;
    };
    imports.wbg.__wbg_maxComputeWorkgroupSizeZ_9fcad0f0dfcffb05 = function(arg0) {
        const ret = arg0.maxComputeWorkgroupSizeZ;
        return ret;
    };
    imports.wbg.__wbg_maxComputeWorkgroupStorageSize_9fe29e00c7d166a6 = function(arg0) {
        const ret = arg0.maxComputeWorkgroupStorageSize;
        return ret;
    };
    imports.wbg.__wbg_maxComputeWorkgroupsPerDimension_f8321761bc8e8feb = function(arg0) {
        const ret = arg0.maxComputeWorkgroupsPerDimension;
        return ret;
    };
    imports.wbg.__wbg_maxDynamicStorageBuffersPerPipelineLayout_55e1416c376721db = function(arg0) {
        const ret = arg0.maxDynamicStorageBuffersPerPipelineLayout;
        return ret;
    };
    imports.wbg.__wbg_maxDynamicUniformBuffersPerPipelineLayout_17ff0903196c41a7 = function(arg0) {
        const ret = arg0.maxDynamicUniformBuffersPerPipelineLayout;
        return ret;
    };
    imports.wbg.__wbg_maxSampledTexturesPerShaderStage_59e5fc159e536f0d = function(arg0) {
        const ret = arg0.maxSampledTexturesPerShaderStage;
        return ret;
    };
    imports.wbg.__wbg_maxSamplersPerShaderStage_84f119909016576b = function(arg0) {
        const ret = arg0.maxSamplersPerShaderStage;
        return ret;
    };
    imports.wbg.__wbg_maxStorageBufferBindingSize_f9c3b3d285375ee0 = function(arg0) {
        const ret = arg0.maxStorageBufferBindingSize;
        return ret;
    };
    imports.wbg.__wbg_maxStorageBuffersPerShaderStage_f84b702138ac86a4 = function(arg0) {
        const ret = arg0.maxStorageBuffersPerShaderStage;
        return ret;
    };
    imports.wbg.__wbg_maxStorageTexturesPerShaderStage_226be46cbf594437 = function(arg0) {
        const ret = arg0.maxStorageTexturesPerShaderStage;
        return ret;
    };
    imports.wbg.__wbg_maxTextureArrayLayers_a8bf77269db7b94e = function(arg0) {
        const ret = arg0.maxTextureArrayLayers;
        return ret;
    };
    imports.wbg.__wbg_maxTextureDimension1D_8e69ba5596959195 = function(arg0) {
        const ret = arg0.maxTextureDimension1D;
        return ret;
    };
    imports.wbg.__wbg_maxTextureDimension2D_5a7a17047785cba5 = function(arg0) {
        const ret = arg0.maxTextureDimension2D;
        return ret;
    };
    imports.wbg.__wbg_maxTextureDimension3D_1ea793f1095d392a = function(arg0) {
        const ret = arg0.maxTextureDimension3D;
        return ret;
    };
    imports.wbg.__wbg_maxUniformBufferBindingSize_4b41f90d6914a995 = function(arg0) {
        const ret = arg0.maxUniformBufferBindingSize;
        return ret;
    };
    imports.wbg.__wbg_maxUniformBuffersPerShaderStage_c5db04bf022a0c83 = function(arg0) {
        const ret = arg0.maxUniformBuffersPerShaderStage;
        return ret;
    };
    imports.wbg.__wbg_maxVertexAttributes_e94e6c887b993b6c = function(arg0) {
        const ret = arg0.maxVertexAttributes;
        return ret;
    };
    imports.wbg.__wbg_maxVertexBufferArrayStride_92c15a2c2f0faf82 = function(arg0) {
        const ret = arg0.maxVertexBufferArrayStride;
        return ret;
    };
    imports.wbg.__wbg_maxVertexBuffers_db05674c76ef98c9 = function(arg0) {
        const ret = arg0.maxVertexBuffers;
        return ret;
    };
    imports.wbg.__wbg_media_077ecdcd98f5aa28 = function(arg0, arg1) {
        const ret = arg1.media;
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbg_metaKey_0572b1cbcb5b272b = function(arg0) {
        const ret = arg0.metaKey;
        return ret;
    };
    imports.wbg.__wbg_metaKey_448c751accad2eba = function(arg0) {
        const ret = arg0.metaKey;
        return ret;
    };
    imports.wbg.__wbg_minStorageBufferOffsetAlignment_2c9fb697a4aedb8b = function(arg0) {
        const ret = arg0.minStorageBufferOffsetAlignment;
        return ret;
    };
    imports.wbg.__wbg_minUniformBufferOffsetAlignment_6357875312bfd2f0 = function(arg0) {
        const ret = arg0.minUniformBufferOffsetAlignment;
        return ret;
    };
    imports.wbg.__wbg_movementX_00c85de14e45c5f4 = function(arg0) {
        const ret = arg0.movementX;
        return ret;
    };
    imports.wbg.__wbg_movementY_9f8470917a12f3f5 = function(arg0) {
        const ret = arg0.movementY;
        return ret;
    };
    imports.wbg.__wbg_navigator_11b7299bb7886507 = function(arg0) {
        const ret = arg0.navigator;
        return ret;
    };
    imports.wbg.__wbg_navigator_b49edef831236138 = function(arg0) {
        const ret = arg0.navigator;
        return ret;
    };
    imports.wbg.__wbg_new_137453588c393c59 = function() { return handleError(function () {
        const ret = new MessageChannel();
        return ret;
    }, arguments) };
    imports.wbg.__wbg_new_1ba21ce319a06297 = function() {
        const ret = new Object();
        return ret;
    };
    imports.wbg.__wbg_new_25f239778d6112b9 = function() {
        const ret = new Array();
        return ret;
    };
    imports.wbg.__wbg_new_53cb1e86c1ef5d2a = function() { return handleError(function (arg0, arg1) {
        const ret = new Worker(getStringFromWasm0(arg0, arg1));
        return ret;
    }, arguments) };
    imports.wbg.__wbg_new_881a222c65f168fc = function() { return handleError(function () {
        const ret = new AbortController();
        return ret;
    }, arguments) };
    imports.wbg.__wbg_new_8a6f238a6ece86ea = function() {
        const ret = new Error();
        return ret;
    };
    imports.wbg.__wbg_new_a25bd305a87faf63 = function() { return handleError(function (arg0) {
        const ret = new ResizeObserver(arg0);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_new_bba60878a7b7f42c = function() { return handleError(function (arg0) {
        const ret = new IntersectionObserver(arg0);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_new_from_slice_f9c22b9153b26992 = function(arg0, arg1) {
        const ret = new Uint8Array(getArrayU8FromWasm0(arg0, arg1));
        return ret;
    };
    imports.wbg.__wbg_new_no_args_cb138f77cf6151ee = function(arg0, arg1) {
        const ret = new Function(getStringFromWasm0(arg0, arg1));
        return ret;
    };
    imports.wbg.__wbg_new_with_byte_offset_and_length_d85c3da1fd8df149 = function(arg0, arg1, arg2) {
        const ret = new Uint8Array(arg0, arg1 >>> 0, arg2 >>> 0);
        return ret;
    };
    imports.wbg.__wbg_new_with_str_sequence_and_options_fe06fc75a8482fd3 = function() { return handleError(function (arg0, arg1) {
        const ret = new Blob(arg0, arg1);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_now_2c95c9de01293173 = function(arg0) {
        const ret = arg0.now();
        return ret;
    };
    imports.wbg.__wbg_now_8cf15d6e317793e1 = function(arg0) {
        const ret = arg0.now();
        return ret;
    };
    imports.wbg.__wbg_observe_5186b67ce86740f9 = function(arg0, arg1) {
        arg0.observe(arg1);
    };
    imports.wbg.__wbg_observe_ce343c3f1701b1f1 = function(arg0, arg1, arg2) {
        arg0.observe(arg1, arg2);
    };
    imports.wbg.__wbg_observe_eefa2465578e5d51 = function(arg0, arg1) {
        arg0.observe(arg1);
    };
    imports.wbg.__wbg_of_6505a0eb509da02e = function(arg0) {
        const ret = Array.of(arg0);
        return ret;
    };
    imports.wbg.__wbg_of_b8cd42ebb79fb759 = function(arg0, arg1) {
        const ret = Array.of(arg0, arg1);
        return ret;
    };
    imports.wbg.__wbg_offsetX_cb6a38e6f23cb4a6 = function(arg0) {
        const ret = arg0.offsetX;
        return ret;
    };
    imports.wbg.__wbg_offsetY_43e21941c5c1f8bf = function(arg0) {
        const ret = arg0.offsetY;
        return ret;
    };
    imports.wbg.__wbg_performance_7a3ffd0b17f663ad = function(arg0) {
        const ret = arg0.performance;
        return ret;
    };
    imports.wbg.__wbg_performance_c77a440eff2efd9b = function(arg0) {
        const ret = arg0.performance;
        return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
    };
    imports.wbg.__wbg_persisted_90586ee41f1f0188 = function(arg0) {
        const ret = arg0.persisted;
        return ret;
    };
    imports.wbg.__wbg_play_63bc12f42e16af91 = function(arg0) {
        arg0.play();
    };
    imports.wbg.__wbg_pointerId_bf4326e151df1474 = function(arg0) {
        const ret = arg0.pointerId;
        return ret;
    };
    imports.wbg.__wbg_pointerType_f1939c6407f96be9 = function(arg0, arg1) {
        const ret = arg1.pointerType;
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbg_port1_75dce9d0d8087125 = function(arg0) {
        const ret = arg0.port1;
        return ret;
    };
    imports.wbg.__wbg_port2_3cffa4119380f41d = function(arg0) {
        const ret = arg0.port2;
        return ret;
    };
    imports.wbg.__wbg_postMessage_79f844174f56304f = function() { return handleError(function (arg0, arg1) {
        arg0.postMessage(arg1);
    }, arguments) };
    imports.wbg.__wbg_postMessage_e0309b53c7ad30e6 = function() { return handleError(function (arg0, arg1, arg2) {
        arg0.postMessage(arg1, arg2);
    }, arguments) };
    imports.wbg.__wbg_postTask_41d93e93941e4a3d = function(arg0, arg1, arg2) {
        const ret = arg0.postTask(arg1, arg2);
        return ret;
    };
    imports.wbg.__wbg_pressure_35422752c1a40439 = function(arg0) {
        const ret = arg0.pressure;
        return ret;
    };
    imports.wbg.__wbg_preventDefault_e97663aeeb9709d3 = function(arg0) {
        arg0.preventDefault();
    };
    imports.wbg.__wbg_prototype_c28bca39c45aba9b = function() {
        const ret = ResizeObserverEntry.prototype;
        return ret;
    };
    imports.wbg.__wbg_prototypesetcall_dfe9b766cdc1f1fd = function(arg0, arg1, arg2) {
        Uint8Array.prototype.set.call(getArrayU8FromWasm0(arg0, arg1), arg2);
    };
    imports.wbg.__wbg_push_7d9be8f38fc13975 = function(arg0, arg1) {
        const ret = arg0.push(arg1);
        return ret;
    };
    imports.wbg.__wbg_querySelectorAll_aa1048eae18f6f1a = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = arg0.querySelectorAll(getStringFromWasm0(arg1, arg2));
        return ret;
    }, arguments) };
    imports.wbg.__wbg_queueMicrotask_892c6bd5d40fe78e = function(arg0, arg1) {
        arg0.queueMicrotask(arg1);
    };
    imports.wbg.__wbg_queueMicrotask_9b549dfce8865860 = function(arg0) {
        const ret = arg0.queueMicrotask;
        return ret;
    };
    imports.wbg.__wbg_queueMicrotask_fca69f5bfad613a5 = function(arg0) {
        queueMicrotask(arg0);
    };
    imports.wbg.__wbg_queue_1f589e8194b004a6 = function(arg0) {
        const ret = arg0.queue;
        return ret;
    };
    imports.wbg.__wbg_removeEventListener_565e273024b68b75 = function() { return handleError(function (arg0, arg1, arg2, arg3) {
        arg0.removeEventListener(getStringFromWasm0(arg1, arg2), arg3);
    }, arguments) };
    imports.wbg.__wbg_removeListener_204002d1eb3f20f6 = function() { return handleError(function (arg0, arg1) {
        arg0.removeListener(arg1);
    }, arguments) };
    imports.wbg.__wbg_removeProperty_c2e16faee2834bef = function() { return handleError(function (arg0, arg1, arg2, arg3) {
        const ret = arg1.removeProperty(getStringFromWasm0(arg2, arg3));
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    }, arguments) };
    imports.wbg.__wbg_repeat_3733d1d584bf0e38 = function(arg0) {
        const ret = arg0.repeat;
        return ret;
    };
    imports.wbg.__wbg_requestAdapter_51be7e8ee7d08b87 = function(arg0, arg1) {
        const ret = arg0.requestAdapter(arg1);
        return ret;
    };
    imports.wbg.__wbg_requestAnimationFrame_994dc4ebde22b8d9 = function() { return handleError(function (arg0, arg1) {
        const ret = arg0.requestAnimationFrame(arg1);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_requestDevice_338f0085866d40a2 = function(arg0, arg1) {
        const ret = arg0.requestDevice(arg1);
        return ret;
    };
    imports.wbg.__wbg_requestFullscreen_86fc6cdb76000482 = function(arg0) {
        const ret = arg0.requestFullscreen;
        return ret;
    };
    imports.wbg.__wbg_requestFullscreen_9f0611438eb929cf = function(arg0) {
        const ret = arg0.requestFullscreen();
        return ret;
    };
    imports.wbg.__wbg_requestIdleCallback_1b8d644ff564208f = function(arg0) {
        const ret = arg0.requestIdleCallback;
        return ret;
    };
    imports.wbg.__wbg_requestIdleCallback_dedd367f2e61f932 = function() { return handleError(function (arg0, arg1) {
        const ret = arg0.requestIdleCallback(arg1);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_resolve_fd5bfbaa4ce36e1e = function(arg0) {
        const ret = Promise.resolve(arg0);
        return ret;
    };
    imports.wbg.__wbg_revokeObjectURL_88db3468842ff09e = function() { return handleError(function (arg0, arg1) {
        URL.revokeObjectURL(getStringFromWasm0(arg0, arg1));
    }, arguments) };
    imports.wbg.__wbg_scheduler_48482a9974eeacbd = function(arg0) {
        const ret = arg0.scheduler;
        return ret;
    };
    imports.wbg.__wbg_scheduler_5156bb61cc1cf589 = function(arg0) {
        const ret = arg0.scheduler;
        return ret;
    };
    imports.wbg.__wbg_setAttribute_34747dd193f45828 = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
        arg0.setAttribute(getStringFromWasm0(arg1, arg2), getStringFromWasm0(arg3, arg4));
    }, arguments) };
    imports.wbg.__wbg_setBindGroup_306b5f43159153da = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6) {
        arg0.setBindGroup(arg1 >>> 0, arg2, getArrayU32FromWasm0(arg3, arg4), arg5, arg6 >>> 0);
    }, arguments) };
    imports.wbg.__wbg_setBindGroup_d3cd0c65d5718e66 = function(arg0, arg1, arg2) {
        arg0.setBindGroup(arg1 >>> 0, arg2);
    };
    imports.wbg.__wbg_setIndexBuffer_30e80db5e2d70b3f = function(arg0, arg1, arg2, arg3, arg4) {
        arg0.setIndexBuffer(arg1, __wbindgen_enum_GpuIndexFormat[arg2], arg3, arg4);
    };
    imports.wbg.__wbg_setIndexBuffer_cf65b9a3b9ae2921 = function(arg0, arg1, arg2, arg3) {
        arg0.setIndexBuffer(arg1, __wbindgen_enum_GpuIndexFormat[arg2], arg3);
    };
    imports.wbg.__wbg_setPipeline_f44bbc63b7455235 = function(arg0, arg1) {
        arg0.setPipeline(arg1);
    };
    imports.wbg.__wbg_setPointerCapture_c611f4bcb7e9081e = function() { return handleError(function (arg0, arg1) {
        arg0.setPointerCapture(arg1);
    }, arguments) };
    imports.wbg.__wbg_setProperty_f27b2c05323daf8a = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
        arg0.setProperty(getStringFromWasm0(arg1, arg2), getStringFromWasm0(arg3, arg4));
    }, arguments) };
    imports.wbg.__wbg_setTimeout_06477c23d31efef1 = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = arg0.setTimeout(arg1, arg2);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_setTimeout_780045617e4bd6d6 = function() { return handleError(function (arg0, arg1) {
        const ret = arg0.setTimeout(arg1);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_setVertexBuffer_5e5ec203042c0564 = function(arg0, arg1, arg2, arg3, arg4) {
        arg0.setVertexBuffer(arg1 >>> 0, arg2, arg3, arg4);
    };
    imports.wbg.__wbg_setVertexBuffer_950908f301fc83b4 = function(arg0, arg1, arg2, arg3) {
        arg0.setVertexBuffer(arg1 >>> 0, arg2, arg3);
    };
    imports.wbg.__wbg_set_781438a03c0c3c81 = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = Reflect.set(arg0, arg1, arg2);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_set_a_6ca4b80abcaa9bb0 = function(arg0, arg1) {
        arg0.a = arg1;
    };
    imports.wbg.__wbg_set_access_c17e0a436ed1d78e = function(arg0, arg1) {
        arg0.access = __wbindgen_enum_GpuStorageTextureAccess[arg1];
    };
    imports.wbg.__wbg_set_alpha_eb6e37beb08f6a6a = function(arg0, arg1) {
        arg0.alpha = arg1;
    };
    imports.wbg.__wbg_set_alpha_mode_2a9be051489d8bbd = function(arg0, arg1) {
        arg0.alphaMode = __wbindgen_enum_GpuCanvasAlphaMode[arg1];
    };
    imports.wbg.__wbg_set_alpha_to_coverage_enabled_1f594c6ef9ae4caa = function(arg0, arg1) {
        arg0.alphaToCoverageEnabled = arg1 !== 0;
    };
    imports.wbg.__wbg_set_array_layer_count_93d58eca9387b84c = function(arg0, arg1) {
        arg0.arrayLayerCount = arg1 >>> 0;
    };
    imports.wbg.__wbg_set_array_stride_5ace211a6c31af55 = function(arg0, arg1) {
        arg0.arrayStride = arg1;
    };
    imports.wbg.__wbg_set_aspect_e3aa9cad44e6338f = function(arg0, arg1) {
        arg0.aspect = __wbindgen_enum_GpuTextureAspect[arg1];
    };
    imports.wbg.__wbg_set_attributes_8cfe8a349778ff6d = function(arg0, arg1) {
        arg0.attributes = arg1;
    };
    imports.wbg.__wbg_set_b_52915cc78721cadb = function(arg0, arg1) {
        arg0.b = arg1;
    };
    imports.wbg.__wbg_set_base_array_layer_798dcd012d28aafd = function(arg0, arg1) {
        arg0.baseArrayLayer = arg1 >>> 0;
    };
    imports.wbg.__wbg_set_base_mip_level_ff05f0742029fbd7 = function(arg0, arg1) {
        arg0.baseMipLevel = arg1 >>> 0;
    };
    imports.wbg.__wbg_set_bc3a432bdcd60886 = function(arg0, arg1, arg2) {
        arg0.set(arg1, arg2 >>> 0);
    };
    imports.wbg.__wbg_set_beginning_of_pass_write_index_ad07a73147217513 = function(arg0, arg1) {
        arg0.beginningOfPassWriteIndex = arg1 >>> 0;
    };
    imports.wbg.__wbg_set_bind_group_layouts_9eff5e187a1db39e = function(arg0, arg1) {
        arg0.bindGroupLayouts = arg1;
    };
    imports.wbg.__wbg_set_binding_3ada8a83c514d419 = function(arg0, arg1) {
        arg0.binding = arg1 >>> 0;
    };
    imports.wbg.__wbg_set_binding_9a389db987313ca9 = function(arg0, arg1) {
        arg0.binding = arg1 >>> 0;
    };
    imports.wbg.__wbg_set_blend_15fcdb6fca391aa3 = function(arg0, arg1) {
        arg0.blend = arg1;
    };
    imports.wbg.__wbg_set_box_d724bbbe6354cf86 = function(arg0, arg1) {
        arg0.box = __wbindgen_enum_ResizeObserverBoxOptions[arg1];
    };
    imports.wbg.__wbg_set_buffer_581ee8422928bd0d = function(arg0, arg1) {
        arg0.buffer = arg1;
    };
    imports.wbg.__wbg_set_buffer_ac25c198252221bd = function(arg0, arg1) {
        arg0.buffer = arg1;
    };
    imports.wbg.__wbg_set_buffers_4515e14c72e1bc45 = function(arg0, arg1) {
        arg0.buffers = arg1;
    };
    imports.wbg.__wbg_set_clear_value_9fd25161e3ff7358 = function(arg0, arg1) {
        arg0.clearValue = arg1;
    };
    imports.wbg.__wbg_set_code_1d146372551ab97f = function(arg0, arg1, arg2) {
        arg0.code = getStringFromWasm0(arg1, arg2);
    };
    imports.wbg.__wbg_set_color_63a788c8828014d8 = function(arg0, arg1) {
        arg0.color = arg1;
    };
    imports.wbg.__wbg_set_color_attachments_b56ec268556eb0af = function(arg0, arg1) {
        arg0.colorAttachments = arg1;
    };
    imports.wbg.__wbg_set_compare_986db63daac4c337 = function(arg0, arg1) {
        arg0.compare = __wbindgen_enum_GpuCompareFunction[arg1];
    };
    imports.wbg.__wbg_set_count_6b3574238f446a02 = function(arg0, arg1) {
        arg0.count = arg1 >>> 0;
    };
    imports.wbg.__wbg_set_cull_mode_f1cc439f208cf7d2 = function(arg0, arg1) {
        arg0.cullMode = __wbindgen_enum_GpuCullMode[arg1];
    };
    imports.wbg.__wbg_set_depth_bias_0c225de07a2372b1 = function(arg0, arg1) {
        arg0.depthBias = arg1;
    };
    imports.wbg.__wbg_set_depth_bias_clamp_bd34181bc74b8a65 = function(arg0, arg1) {
        arg0.depthBiasClamp = arg1;
    };
    imports.wbg.__wbg_set_depth_bias_slope_scale_d43ddce65f19c9be = function(arg0, arg1) {
        arg0.depthBiasSlopeScale = arg1;
    };
    imports.wbg.__wbg_set_depth_clear_value_eb76fedd34b20053 = function(arg0, arg1) {
        arg0.depthClearValue = arg1;
    };
    imports.wbg.__wbg_set_depth_compare_491947ed2f6065b9 = function(arg0, arg1) {
        arg0.depthCompare = __wbindgen_enum_GpuCompareFunction[arg1];
    };
    imports.wbg.__wbg_set_depth_fail_op_4983b01413b9f743 = function(arg0, arg1) {
        arg0.depthFailOp = __wbindgen_enum_GpuStencilOperation[arg1];
    };
    imports.wbg.__wbg_set_depth_load_op_c7deb718c4129a2c = function(arg0, arg1) {
        arg0.depthLoadOp = __wbindgen_enum_GpuLoadOp[arg1];
    };
    imports.wbg.__wbg_set_depth_or_array_layers_5686e74657700bc2 = function(arg0, arg1) {
        arg0.depthOrArrayLayers = arg1 >>> 0;
    };
    imports.wbg.__wbg_set_depth_read_only_18602250b14fa638 = function(arg0, arg1) {
        arg0.depthReadOnly = arg1 !== 0;
    };
    imports.wbg.__wbg_set_depth_stencil_attachment_90d13c414095197d = function(arg0, arg1) {
        arg0.depthStencilAttachment = arg1;
    };
    imports.wbg.__wbg_set_depth_stencil_e6069a8b511d1004 = function(arg0, arg1) {
        arg0.depthStencil = arg1;
    };
    imports.wbg.__wbg_set_depth_store_op_55f84f2f9039c453 = function(arg0, arg1) {
        arg0.depthStoreOp = __wbindgen_enum_GpuStoreOp[arg1];
    };
    imports.wbg.__wbg_set_depth_write_enabled_e419ffe553654371 = function(arg0, arg1) {
        arg0.depthWriteEnabled = arg1 !== 0;
    };
    imports.wbg.__wbg_set_device_91facdf766d51abf = function(arg0, arg1) {
        arg0.device = arg1;
    };
    imports.wbg.__wbg_set_dimension_47ad758bb7805028 = function(arg0, arg1) {
        arg0.dimension = __wbindgen_enum_GpuTextureViewDimension[arg1];
    };
    imports.wbg.__wbg_set_dimension_500c3bec57e8ac12 = function(arg0, arg1) {
        arg0.dimension = __wbindgen_enum_GpuTextureDimension[arg1];
    };
    imports.wbg.__wbg_set_dst_factor_abdf4d85b8f742b5 = function(arg0, arg1) {
        arg0.dstFactor = __wbindgen_enum_GpuBlendFactor[arg1];
    };
    imports.wbg.__wbg_set_end_of_pass_write_index_82a42f6ec7d55754 = function(arg0, arg1) {
        arg0.endOfPassWriteIndex = arg1 >>> 0;
    };
    imports.wbg.__wbg_set_entries_136baaaafb25087f = function(arg0, arg1) {
        arg0.entries = arg1;
    };
    imports.wbg.__wbg_set_entries_7c41d594195ebe78 = function(arg0, arg1) {
        arg0.entries = arg1;
    };
    imports.wbg.__wbg_set_entry_point_913e091cc9a07667 = function(arg0, arg1, arg2) {
        arg0.entryPoint = getStringFromWasm0(arg1, arg2);
    };
    imports.wbg.__wbg_set_entry_point_96944272d50efb55 = function(arg0, arg1, arg2) {
        arg0.entryPoint = getStringFromWasm0(arg1, arg2);
    };
    imports.wbg.__wbg_set_fail_op_fd94b46d0cd7c4f2 = function(arg0, arg1) {
        arg0.failOp = __wbindgen_enum_GpuStencilOperation[arg1];
    };
    imports.wbg.__wbg_set_format_29126ee763612515 = function(arg0, arg1) {
        arg0.format = __wbindgen_enum_GpuTextureFormat[arg1];
    };
    imports.wbg.__wbg_set_format_450c4be578985cb4 = function(arg0, arg1) {
        arg0.format = __wbindgen_enum_GpuVertexFormat[arg1];
    };
    imports.wbg.__wbg_set_format_582f639b8a79115c = function(arg0, arg1) {
        arg0.format = __wbindgen_enum_GpuTextureFormat[arg1];
    };
    imports.wbg.__wbg_set_format_6ac892268eeef402 = function(arg0, arg1) {
        arg0.format = __wbindgen_enum_GpuTextureFormat[arg1];
    };
    imports.wbg.__wbg_set_format_a622a57e42ae23e4 = function(arg0, arg1) {
        arg0.format = __wbindgen_enum_GpuTextureFormat[arg1];
    };
    imports.wbg.__wbg_set_format_bdfc7be2aa989382 = function(arg0, arg1) {
        arg0.format = __wbindgen_enum_GpuTextureFormat[arg1];
    };
    imports.wbg.__wbg_set_format_c3ba1e26468014ae = function(arg0, arg1) {
        arg0.format = __wbindgen_enum_GpuTextureFormat[arg1];
    };
    imports.wbg.__wbg_set_fragment_84f03cfa83c432b2 = function(arg0, arg1) {
        arg0.fragment = arg1;
    };
    imports.wbg.__wbg_set_front_face_1c87b2e21f85a97f = function(arg0, arg1) {
        arg0.frontFace = __wbindgen_enum_GpuFrontFace[arg1];
    };
    imports.wbg.__wbg_set_g_b94c63958617b86c = function(arg0, arg1) {
        arg0.g = arg1;
    };
    imports.wbg.__wbg_set_has_dynamic_offset_9dc29179158975e4 = function(arg0, arg1) {
        arg0.hasDynamicOffset = arg1 !== 0;
    };
    imports.wbg.__wbg_set_height_080fa3e226a83750 = function(arg0, arg1) {
        arg0.height = arg1 >>> 0;
    };
    imports.wbg.__wbg_set_height_6f8f8ef4cb40e496 = function(arg0, arg1) {
        arg0.height = arg1 >>> 0;
    };
    imports.wbg.__wbg_set_height_afe09c24165867f7 = function(arg0, arg1) {
        arg0.height = arg1 >>> 0;
    };
    imports.wbg.__wbg_set_label_034d85243342ac5c = function(arg0, arg1, arg2) {
        arg0.label = getStringFromWasm0(arg1, arg2);
    };
    imports.wbg.__wbg_set_label_1e2e0069cbf2bd78 = function(arg0, arg1, arg2) {
        arg0.label = getStringFromWasm0(arg1, arg2);
    };
    imports.wbg.__wbg_set_label_21544401e31cd317 = function(arg0, arg1, arg2) {
        arg0.label = getStringFromWasm0(arg1, arg2);
    };
    imports.wbg.__wbg_set_label_2312a64e22934a2b = function(arg0, arg1, arg2) {
        arg0.label = getStringFromWasm0(arg1, arg2);
    };
    imports.wbg.__wbg_set_label_2ed86217d97ea3d5 = function(arg0, arg1, arg2) {
        arg0.label = getStringFromWasm0(arg1, arg2);
    };
    imports.wbg.__wbg_set_label_3f988ca8291e319f = function(arg0, arg1, arg2) {
        arg0.label = getStringFromWasm0(arg1, arg2);
    };
    imports.wbg.__wbg_set_label_73d706a16d13a23c = function(arg0, arg1, arg2) {
        arg0.label = getStringFromWasm0(arg1, arg2);
    };
    imports.wbg.__wbg_set_label_81dd67dee9cd4287 = function(arg0, arg1, arg2) {
        arg0.label = getStringFromWasm0(arg1, arg2);
    };
    imports.wbg.__wbg_set_label_8f9ebe053f8da7a0 = function(arg0, arg1, arg2) {
        arg0.label = getStringFromWasm0(arg1, arg2);
    };
    imports.wbg.__wbg_set_label_bfbd23fc748f8f94 = function(arg0, arg1, arg2) {
        arg0.label = getStringFromWasm0(arg1, arg2);
    };
    imports.wbg.__wbg_set_label_d400966bd7759b26 = function(arg0, arg1, arg2) {
        arg0.label = getStringFromWasm0(arg1, arg2);
    };
    imports.wbg.__wbg_set_label_ecb2c1eab1d46433 = function(arg0, arg1, arg2) {
        arg0.label = getStringFromWasm0(arg1, arg2);
    };
    imports.wbg.__wbg_set_layout_0770a97fe3411616 = function(arg0, arg1) {
        arg0.layout = arg1;
    };
    imports.wbg.__wbg_set_layout_0e88cce0b3d76c31 = function(arg0, arg1) {
        arg0.layout = arg1;
    };
    imports.wbg.__wbg_set_load_op_6725bf0c5b509ae7 = function(arg0, arg1) {
        arg0.loadOp = __wbindgen_enum_GpuLoadOp[arg1];
    };
    imports.wbg.__wbg_set_mapped_at_creation_e0c884a30f64323b = function(arg0, arg1) {
        arg0.mappedAtCreation = arg1 !== 0;
    };
    imports.wbg.__wbg_set_mask_9094d3e3f6f3a7dc = function(arg0, arg1) {
        arg0.mask = arg1 >>> 0;
    };
    imports.wbg.__wbg_set_min_binding_size_4a9f4d0d9ee579af = function(arg0, arg1) {
        arg0.minBindingSize = arg1;
    };
    imports.wbg.__wbg_set_mip_level_count_1d13855f7726190c = function(arg0, arg1) {
        arg0.mipLevelCount = arg1 >>> 0;
    };
    imports.wbg.__wbg_set_mip_level_count_a5a0102e4248e5bb = function(arg0, arg1) {
        arg0.mipLevelCount = arg1 >>> 0;
    };
    imports.wbg.__wbg_set_module_882651860e912779 = function(arg0, arg1) {
        arg0.module = arg1;
    };
    imports.wbg.__wbg_set_module_b46c4a937ee89c3b = function(arg0, arg1) {
        arg0.module = arg1;
    };
    imports.wbg.__wbg_set_multisample_0a38af2e310bacc6 = function(arg0, arg1) {
        arg0.multisample = arg1;
    };
    imports.wbg.__wbg_set_multisampled_f2de771b3ad62ff3 = function(arg0, arg1) {
        arg0.multisampled = arg1 !== 0;
    };
    imports.wbg.__wbg_set_offset_31c0a660f535c545 = function(arg0, arg1) {
        arg0.offset = arg1;
    };
    imports.wbg.__wbg_set_offset_a675629849c5f3b4 = function(arg0, arg1) {
        arg0.offset = arg1;
    };
    imports.wbg.__wbg_set_onmessage_f0d5bf805190d1d8 = function(arg0, arg1) {
        arg0.onmessage = arg1;
    };
    imports.wbg.__wbg_set_operation_879618283d591339 = function(arg0, arg1) {
        arg0.operation = __wbindgen_enum_GpuBlendOperation[arg1];
    };
    imports.wbg.__wbg_set_pass_op_238c7cbc20505ae9 = function(arg0, arg1) {
        arg0.passOp = __wbindgen_enum_GpuStencilOperation[arg1];
    };
    imports.wbg.__wbg_set_power_preference_f4cead100f48bab0 = function(arg0, arg1) {
        arg0.powerPreference = __wbindgen_enum_GpuPowerPreference[arg1];
    };
    imports.wbg.__wbg_set_primitive_01150af3e98fb372 = function(arg0, arg1) {
        arg0.primitive = arg1;
    };
    imports.wbg.__wbg_set_query_set_8441106911a3af36 = function(arg0, arg1) {
        arg0.querySet = arg1;
    };
    imports.wbg.__wbg_set_r_08c1678b22216ee0 = function(arg0, arg1) {
        arg0.r = arg1;
    };
    imports.wbg.__wbg_set_required_features_e9ee2e22feba0db3 = function(arg0, arg1) {
        arg0.requiredFeatures = arg1;
    };
    imports.wbg.__wbg_set_resolve_target_d00e2ef5a7388503 = function(arg0, arg1) {
        arg0.resolveTarget = arg1;
    };
    imports.wbg.__wbg_set_resource_5a4cc69a127b394e = function(arg0, arg1) {
        arg0.resource = arg1;
    };
    imports.wbg.__wbg_set_sample_count_c44a2a6eebe72dcc = function(arg0, arg1) {
        arg0.sampleCount = arg1 >>> 0;
    };
    imports.wbg.__wbg_set_sample_type_89fd8e71274ee6c2 = function(arg0, arg1) {
        arg0.sampleType = __wbindgen_enum_GpuTextureSampleType[arg1];
    };
    imports.wbg.__wbg_set_sampler_ab33334fb83c5a17 = function(arg0, arg1) {
        arg0.sampler = arg1;
    };
    imports.wbg.__wbg_set_shader_location_b905e964144cc9ad = function(arg0, arg1) {
        arg0.shaderLocation = arg1 >>> 0;
    };
    imports.wbg.__wbg_set_size_a877ed6f434871bd = function(arg0, arg1) {
        arg0.size = arg1;
    };
    imports.wbg.__wbg_set_size_b2cab7e432ec25dc = function(arg0, arg1) {
        arg0.size = arg1;
    };
    imports.wbg.__wbg_set_size_c167af29ed0f618c = function(arg0, arg1) {
        arg0.size = arg1;
    };
    imports.wbg.__wbg_set_src_factor_3bf35cc93f12e8c2 = function(arg0, arg1) {
        arg0.srcFactor = __wbindgen_enum_GpuBlendFactor[arg1];
    };
    imports.wbg.__wbg_set_stencil_back_6d0e3812c09eb489 = function(arg0, arg1) {
        arg0.stencilBack = arg1;
    };
    imports.wbg.__wbg_set_stencil_clear_value_53b51b80af22b8a4 = function(arg0, arg1) {
        arg0.stencilClearValue = arg1 >>> 0;
    };
    imports.wbg.__wbg_set_stencil_front_223b59e436e04d2d = function(arg0, arg1) {
        arg0.stencilFront = arg1;
    };
    imports.wbg.__wbg_set_stencil_load_op_d88ff17c1f14f3b3 = function(arg0, arg1) {
        arg0.stencilLoadOp = __wbindgen_enum_GpuLoadOp[arg1];
    };
    imports.wbg.__wbg_set_stencil_read_mask_f7b2d22f2682c8f6 = function(arg0, arg1) {
        arg0.stencilReadMask = arg1 >>> 0;
    };
    imports.wbg.__wbg_set_stencil_read_only_6fba8956bae14007 = function(arg0, arg1) {
        arg0.stencilReadOnly = arg1 !== 0;
    };
    imports.wbg.__wbg_set_stencil_store_op_9637a0cb039fc7bb = function(arg0, arg1) {
        arg0.stencilStoreOp = __wbindgen_enum_GpuStoreOp[arg1];
    };
    imports.wbg.__wbg_set_stencil_write_mask_fc2b202439c71444 = function(arg0, arg1) {
        arg0.stencilWriteMask = arg1 >>> 0;
    };
    imports.wbg.__wbg_set_step_mode_953dbc499c2ea5db = function(arg0, arg1) {
        arg0.stepMode = __wbindgen_enum_GpuVertexStepMode[arg1];
    };
    imports.wbg.__wbg_set_storage_texture_0634dd6c87ac1132 = function(arg0, arg1) {
        arg0.storageTexture = arg1;
    };
    imports.wbg.__wbg_set_store_op_d6e36afb7a3bc15a = function(arg0, arg1) {
        arg0.storeOp = __wbindgen_enum_GpuStoreOp[arg1];
    };
    imports.wbg.__wbg_set_strip_index_format_6813dd6e867de4f2 = function(arg0, arg1) {
        arg0.stripIndexFormat = __wbindgen_enum_GpuIndexFormat[arg1];
    };
    imports.wbg.__wbg_set_targets_0ab03a33d2c15ccd = function(arg0, arg1) {
        arg0.targets = arg1;
    };
    imports.wbg.__wbg_set_texture_9dc3759e93cfbb84 = function(arg0, arg1) {
        arg0.texture = arg1;
    };
    imports.wbg.__wbg_set_timestamp_writes_736aa6c2c69ccaea = function(arg0, arg1) {
        arg0.timestampWrites = arg1;
    };
    imports.wbg.__wbg_set_topology_84962f44b37e8986 = function(arg0, arg1) {
        arg0.topology = __wbindgen_enum_GpuPrimitiveTopology[arg1];
    };
    imports.wbg.__wbg_set_type_4ff365ea9ad896aa = function(arg0, arg1) {
        arg0.type = __wbindgen_enum_GpuBufferBindingType[arg1];
    };
    imports.wbg.__wbg_set_type_7ce650670a34c68f = function(arg0, arg1, arg2) {
        arg0.type = getStringFromWasm0(arg1, arg2);
    };
    imports.wbg.__wbg_set_type_b4b2fc6fbad39aeb = function(arg0, arg1) {
        arg0.type = __wbindgen_enum_GpuSamplerBindingType[arg1];
    };
    imports.wbg.__wbg_set_usage_3bf7bce356282919 = function(arg0, arg1) {
        arg0.usage = arg1 >>> 0;
    };
    imports.wbg.__wbg_set_usage_48c9e7b82b575c9a = function(arg0, arg1) {
        arg0.usage = arg1 >>> 0;
    };
    imports.wbg.__wbg_set_usage_a102e6844c6a65de = function(arg0, arg1) {
        arg0.usage = arg1 >>> 0;
    };
    imports.wbg.__wbg_set_usage_ea5e5efc19daea09 = function(arg0, arg1) {
        arg0.usage = arg1 >>> 0;
    };
    imports.wbg.__wbg_set_vertex_96327c405a801524 = function(arg0, arg1) {
        arg0.vertex = arg1;
    };
    imports.wbg.__wbg_set_view_2d2806aa6c5822ca = function(arg0, arg1) {
        arg0.view = arg1;
    };
    imports.wbg.__wbg_set_view_b7216eb00b7f584a = function(arg0, arg1) {
        arg0.view = arg1;
    };
    imports.wbg.__wbg_set_view_dimension_c6aedf84f79e2593 = function(arg0, arg1) {
        arg0.viewDimension = __wbindgen_enum_GpuTextureViewDimension[arg1];
    };
    imports.wbg.__wbg_set_view_dimension_ccb64a21a1495106 = function(arg0, arg1) {
        arg0.viewDimension = __wbindgen_enum_GpuTextureViewDimension[arg1];
    };
    imports.wbg.__wbg_set_view_formats_65a3ce6335913be2 = function(arg0, arg1) {
        arg0.viewFormats = arg1;
    };
    imports.wbg.__wbg_set_view_formats_d7be9eae49a0933b = function(arg0, arg1) {
        arg0.viewFormats = arg1;
    };
    imports.wbg.__wbg_set_visibility_3445d21752d17ded = function(arg0, arg1) {
        arg0.visibility = arg1 >>> 0;
    };
    imports.wbg.__wbg_set_width_0a22c810f06a5152 = function(arg0, arg1) {
        arg0.width = arg1 >>> 0;
    };
    imports.wbg.__wbg_set_width_7ff7a22c6e9f423e = function(arg0, arg1) {
        arg0.width = arg1 >>> 0;
    };
    imports.wbg.__wbg_set_width_ff3dae6ae4838a9e = function(arg0, arg1) {
        arg0.width = arg1 >>> 0;
    };
    imports.wbg.__wbg_set_write_mask_b94f0c67654d5b00 = function(arg0, arg1) {
        arg0.writeMask = arg1 >>> 0;
    };
    imports.wbg.__wbg_shiftKey_a6df227a917d203b = function(arg0) {
        const ret = arg0.shiftKey;
        return ret;
    };
    imports.wbg.__wbg_shiftKey_d2640abcfa98acec = function(arg0) {
        const ret = arg0.shiftKey;
        return ret;
    };
    imports.wbg.__wbg_signal_3c14fbdc89694b39 = function(arg0) {
        const ret = arg0.signal;
        return ret;
    };
    imports.wbg.__wbg_stack_0ed75d68575b0f3c = function(arg0, arg1) {
        const ret = arg1.stack;
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbg_start_dd05b3be5674e9f3 = function(arg0) {
        arg0.start();
    };
    imports.wbg.__wbg_static_accessor_GLOBAL_769e6b65d6557335 = function() {
        const ret = typeof global === 'undefined' ? null : global;
        return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
    };
    imports.wbg.__wbg_static_accessor_GLOBAL_THIS_60cf02db4de8e1c1 = function() {
        const ret = typeof globalThis === 'undefined' ? null : globalThis;
        return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
    };
    imports.wbg.__wbg_static_accessor_SELF_08f5a74c69739274 = function() {
        const ret = typeof self === 'undefined' ? null : self;
        return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
    };
    imports.wbg.__wbg_static_accessor_WINDOW_a8924b26aa92d024 = function() {
        const ret = typeof window === 'undefined' ? null : window;
        return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
    };
    imports.wbg.__wbg_style_521a717da50e53c6 = function(arg0) {
        const ret = arg0.style;
        return ret;
    };
    imports.wbg.__wbg_submit_522f9e0b9d7e22fd = function(arg0, arg1) {
        arg0.submit(arg1);
    };
    imports.wbg.__wbg_then_429f7caf1026411d = function(arg0, arg1, arg2) {
        const ret = arg0.then(arg1, arg2);
        return ret;
    };
    imports.wbg.__wbg_then_4f95312d68691235 = function(arg0, arg1) {
        const ret = arg0.then(arg1);
        return ret;
    };
    imports.wbg.__wbg_unmap_a7fc4fb3238304a4 = function(arg0) {
        arg0.unmap();
    };
    imports.wbg.__wbg_unobserve_0d3c5074b9205239 = function(arg0, arg1) {
        arg0.unobserve(arg1);
    };
    imports.wbg.__wbg_userAgentData_f7b0e61c05c54315 = function(arg0) {
        const ret = arg0.userAgentData;
        return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
    };
    imports.wbg.__wbg_userAgent_e18bc0cc9ad38ec1 = function() { return handleError(function (arg0, arg1) {
        const ret = arg1.userAgent;
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    }, arguments) };
    imports.wbg.__wbg_visibilityState_2f27cbaac764b521 = function(arg0) {
        const ret = arg0.visibilityState;
        return (__wbindgen_enum_VisibilityState.indexOf(ret) + 1 || 3) - 1;
    };
    imports.wbg.__wbg_warn_6e567d0d926ff881 = function(arg0) {
        console.warn(arg0);
    };
    imports.wbg.__wbg_webkitFullscreenElement_a9ca38b7214d1567 = function(arg0) {
        const ret = arg0.webkitFullscreenElement;
        return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
    };
    imports.wbg.__wbg_webkitRequestFullscreen_23664c63833ff0e5 = function(arg0) {
        arg0.webkitRequestFullscreen();
    };
    imports.wbg.__wbg_width_30d712cfe70e4fae = function(arg0) {
        const ret = arg0.width;
        return ret;
    };
    imports.wbg.__wbg_width_dd0cfe94d42f5143 = function(arg0) {
        const ret = arg0.width;
        return ret;
    };
    imports.wbg.__wbg_writeBuffer_b3540dd159ff60f1 = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5) {
        arg0.writeBuffer(arg1, arg2, arg3, arg4, arg5);
    }, arguments) };
    imports.wbg.__wbindgen_cast_0763b5aa68cf42f6 = function(arg0, arg1) {
        // Cast intrinsic for `Closure(Closure { dtor_idx: 323, function: Function { arguments: [NamedExternref("Event")], shim_idx: 324, ret: Unit, inner_ret: Some(Unit) }, mutable: true }) -> Externref`.
        const ret = makeMutClosure(arg0, arg1, wasm.wasm_bindgen__closure__destroy__h3de00de315369fa6, wasm_bindgen__convert__closures_____invoke__h2158eb8bd813e32f);
        return ret;
    };
    imports.wbg.__wbindgen_cast_17908b946c401fc2 = function(arg0, arg1) {
        // Cast intrinsic for `Closure(Closure { dtor_idx: 323, function: Function { arguments: [NamedExternref("WheelEvent")], shim_idx: 324, ret: Unit, inner_ret: Some(Unit) }, mutable: true }) -> Externref`.
        const ret = makeMutClosure(arg0, arg1, wasm.wasm_bindgen__closure__destroy__h3de00de315369fa6, wasm_bindgen__convert__closures_____invoke__h2158eb8bd813e32f);
        return ret;
    };
    imports.wbg.__wbindgen_cast_2241b6af4c4b2941 = function(arg0, arg1) {
        // Cast intrinsic for `Ref(String) -> Externref`.
        const ret = getStringFromWasm0(arg0, arg1);
        return ret;
    };
    imports.wbg.__wbindgen_cast_258d7f842a224852 = function(arg0, arg1) {
        // Cast intrinsic for `Closure(Closure { dtor_idx: 378, function: Function { arguments: [Externref], shim_idx: 379, ret: Unit, inner_ret: Some(Unit) }, mutable: true }) -> Externref`.
        const ret = makeMutClosure(arg0, arg1, wasm.wasm_bindgen__closure__destroy__h4ddda9fd9ee410a8, wasm_bindgen__convert__closures_____invoke__hcb8cfa4477b9920e);
        return ret;
    };
    imports.wbg.__wbindgen_cast_4df16dd676e30285 = function(arg0, arg1) {
        // Cast intrinsic for `Closure(Closure { dtor_idx: 323, function: Function { arguments: [NamedExternref("Array<any>")], shim_idx: 324, ret: Unit, inner_ret: Some(Unit) }, mutable: true }) -> Externref`.
        const ret = makeMutClosure(arg0, arg1, wasm.wasm_bindgen__closure__destroy__h3de00de315369fa6, wasm_bindgen__convert__closures_____invoke__h2158eb8bd813e32f);
        return ret;
    };
    imports.wbg.__wbindgen_cast_56defc613dac9c56 = function(arg0, arg1) {
        // Cast intrinsic for `Closure(Closure { dtor_idx: 323, function: Function { arguments: [NamedExternref("Array<any>"), NamedExternref("ResizeObserver")], shim_idx: 330, ret: Unit, inner_ret: Some(Unit) }, mutable: true }) -> Externref`.
        const ret = makeMutClosure(arg0, arg1, wasm.wasm_bindgen__closure__destroy__h3de00de315369fa6, wasm_bindgen__convert__closures_____invoke__h07d73f73f4fdf0a1);
        return ret;
    };
    imports.wbg.__wbindgen_cast_61785a907de1dbdd = function(arg0, arg1) {
        // Cast intrinsic for `Closure(Closure { dtor_idx: 323, function: Function { arguments: [NamedExternref("PointerEvent")], shim_idx: 324, ret: Unit, inner_ret: Some(Unit) }, mutable: true }) -> Externref`.
        const ret = makeMutClosure(arg0, arg1, wasm.wasm_bindgen__closure__destroy__h3de00de315369fa6, wasm_bindgen__convert__closures_____invoke__h2158eb8bd813e32f);
        return ret;
    };
    imports.wbg.__wbindgen_cast_64c7eeb4009acfcc = function(arg0, arg1) {
        // Cast intrinsic for `Closure(Closure { dtor_idx: 323, function: Function { arguments: [], shim_idx: 326, ret: Unit, inner_ret: Some(Unit) }, mutable: true }) -> Externref`.
        const ret = makeMutClosure(arg0, arg1, wasm.wasm_bindgen__closure__destroy__h3de00de315369fa6, wasm_bindgen__convert__closures_____invoke__h686082b566de68ab);
        return ret;
    };
    imports.wbg.__wbindgen_cast_6bb0d16093521e16 = function(arg0, arg1) {
        // Cast intrinsic for `Closure(Closure { dtor_idx: 323, function: Function { arguments: [NamedExternref("PageTransitionEvent")], shim_idx: 324, ret: Unit, inner_ret: Some(Unit) }, mutable: true }) -> Externref`.
        const ret = makeMutClosure(arg0, arg1, wasm.wasm_bindgen__closure__destroy__h3de00de315369fa6, wasm_bindgen__convert__closures_____invoke__h2158eb8bd813e32f);
        return ret;
    };
    imports.wbg.__wbindgen_cast_7d65b24ea5f2af3b = function(arg0, arg1) {
        // Cast intrinsic for `Closure(Closure { dtor_idx: 323, function: Function { arguments: [NamedExternref("KeyboardEvent")], shim_idx: 324, ret: Unit, inner_ret: Some(Unit) }, mutable: true }) -> Externref`.
        const ret = makeMutClosure(arg0, arg1, wasm.wasm_bindgen__closure__destroy__h3de00de315369fa6, wasm_bindgen__convert__closures_____invoke__h2158eb8bd813e32f);
        return ret;
    };
    imports.wbg.__wbindgen_cast_cb9088102bce6b30 = function(arg0, arg1) {
        // Cast intrinsic for `Ref(Slice(U8)) -> NamedExternref("Uint8Array")`.
        const ret = getArrayU8FromWasm0(arg0, arg1);
        return ret;
    };
    imports.wbg.__wbindgen_cast_d6cd19b81560fd6e = function(arg0) {
        // Cast intrinsic for `F64 -> Externref`.
        const ret = arg0;
        return ret;
    };
    imports.wbg.__wbindgen_cast_fa60ce5af84fd7c8 = function(arg0, arg1) {
        // Cast intrinsic for `Closure(Closure { dtor_idx: 323, function: Function { arguments: [NamedExternref("FocusEvent")], shim_idx: 324, ret: Unit, inner_ret: Some(Unit) }, mutable: true }) -> Externref`.
        const ret = makeMutClosure(arg0, arg1, wasm.wasm_bindgen__closure__destroy__h3de00de315369fa6, wasm_bindgen__convert__closures_____invoke__h2158eb8bd813e32f);
        return ret;
    };
    imports.wbg.__wbindgen_init_externref_table = function() {
        const table = wasm.__wbindgen_externrefs;
        const offset = table.grow(4);
        table.set(0, undefined);
        table.set(offset + 0, undefined);
        table.set(offset + 1, null);
        table.set(offset + 2, true);
        table.set(offset + 3, false);
    };

    return imports;
}

function __wbg_finalize_init(instance, module) {
    wasm = instance.exports;
    __wbg_init.__wbindgen_wasm_module = module;
    cachedDataViewMemory0 = null;
    cachedUint32ArrayMemory0 = null;
    cachedUint8ArrayMemory0 = null;


    wasm.__wbindgen_start();
    return wasm;
}

function initSync(module) {
    if (wasm !== undefined) return wasm;


    if (typeof module !== 'undefined') {
        if (Object.getPrototypeOf(module) === Object.prototype) {
            ({module} = module)
        } else {
            console.warn('using deprecated parameters for `initSync()`; pass a single object instead')
        }
    }

    const imports = __wbg_get_imports();
    if (!(module instanceof WebAssembly.Module)) {
        module = new WebAssembly.Module(module);
    }
    const instance = new WebAssembly.Instance(module, imports);
    return __wbg_finalize_init(instance, module);
}

async function __wbg_init(module_or_path) {
    if (wasm !== undefined) return wasm;


    if (typeof module_or_path !== 'undefined') {
        if (Object.getPrototypeOf(module_or_path) === Object.prototype) {
            ({module_or_path} = module_or_path)
        } else {
            console.warn('using deprecated parameters for the initialization function; pass a single object instead')
        }
    }

    if (typeof module_or_path === 'undefined') {
        module_or_path = new URL('ik_webgpu_bg.wasm', import.meta.url);
    }
    const imports = __wbg_get_imports();

    if (typeof module_or_path === 'string' || (typeof Request === 'function' && module_or_path instanceof Request) || (typeof URL === 'function' && module_or_path instanceof URL)) {
        module_or_path = fetch(module_or_path);
    }

    const { instance, module } = await __wbg_load(await module_or_path, imports);

    return __wbg_finalize_init(instance, module);
}

export { initSync };
export default __wbg_init;
