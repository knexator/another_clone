import Effect from "shaku/lib/gfx/effects/effect";

// vertex shader code
const vertexShader = `#version 300 es
in vec3 a_position;
in vec2 a_coord;

uniform mat4 u_projection;
uniform mat4 u_world;
uniform vec2 u_screen_size;

out vec2 v_texCoord;

void main(void) {
    gl_Position = u_projection * u_world * vec4(a_position, 1.0);
    gl_PointSize = 1.0;
    v_texCoord = a_coord * u_screen_size;
}`;

// fragment shader code
const fragmentShader = `#version 300 es
precision highp float;

uniform float u_progress;
uniform vec2 u_pos;

in vec2 v_texCoord;
out vec4 FragColor;

void main(void) {

    // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = v_texCoord;

    float d = length(uv - u_pos);
    float is_dark = smoothstep(-75.0, 75.0, d - 900.0 + u_progress * 900.0);

    // Output to screen
    FragColor = vec4(0.0, 0.0, 0.0, is_dark);
}`;

export class TransitionEffect extends Effect {
    /** @inheritdoc */
    get vertexCode() {
        return vertexShader;
    }

    /** @inheritdoc */
    get fragmentCode() {
        return fragmentShader;
    }

    /** @inheritdoc */
    get uniformTypes() {
        return {
            "u_projection": { type: Effect.UniformTypes.Matrix, bind: Effect.UniformBinds.Projection },
            "u_world": { type: Effect.UniformTypes.Matrix, bind: Effect.UniformBinds.World },
            // "u_time": { type: Effect.UniformTypes.Float, bind: "u_time" },
            "u_screen_size": { type: Effect.UniformTypes.Float2, bind: "u_screen_size" },
            "u_progress": { type: Effect.UniformTypes.Float, bind: "u_progress" },
            "u_pos": { type: Effect.UniformTypes.Float2, bind: "u_pos" },
            // "u_alpha": { type: Effect.UniformTypes.Float, bind: "u_alpha" },
        };
    }

    /** @inheritdoc */
    get attributeTypes() {
        return {
            "a_position": { size: 3, type: Effect.AttributeTypes.Float, normalize: false, bind: Effect.AttributeBinds.Position },
            "a_coord": { size: 2, type: Effect.AttributeTypes.Float, normalize: false, bind: Effect.AttributeBinds.TextureCoords },
        };
    }
}



// todo: fix shaku UniformTypes, in:
// declare namespace UniformTypes {
//     const _values: any;
// }