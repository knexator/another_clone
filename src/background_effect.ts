import Effect from "shaku/lib/gfx/effects/effect";

// vertex shader code
const vertexShader = `#version 300 es
in vec3 a_position;
in vec2 a_coord;

uniform mat4 u_projection;
uniform mat4 u_world;
uniform float u_aspect_ratio;

out vec2 v_texCoord;

void main(void) {
    gl_Position = u_projection * u_world * vec4(a_position, 1.0);
    gl_PointSize = 1.0;
    v_texCoord = a_coord * vec2(u_aspect_ratio * 2.0, 2.0) - vec2(u_aspect_ratio, 1.0);
}`;

// fragment shader code
const fragmentShader = `#version 300 es
precision highp float;

uniform float u_time;

in vec2 v_texCoord;
out vec4 FragColor;

/* discontinuous pseudorandom uniformly distributed in [-0.5, +0.5]^3 */
vec3 random3(vec3 c) {
	float j = 4096.0*sin(dot(c,vec3(17.0, 59.4, 15.0)));
	vec3 r;
	r.z = fract(512.0*j);
	j *= .125;
	r.x = fract(512.0*j);
	j *= .125;
	r.y = fract(512.0*j);
	return r-0.5;
}

/* skew constants for 3d simplex functions */
const float F3 =  0.3333333;
const float G3 =  0.1666667;

/* 3d simplex noise */
float simplex3d(vec3 p) {
	 /* 1. find current tetrahedron T and it's four vertices */
	 /* s, s+i1, s+i2, s+1.0 - absolute skewed (integer) coordinates of T vertices */
	 /* x, x1, x2, x3 - unskewed coordinates of p relative to each of T vertices*/
	 
	 /* calculate s and x */
	 vec3 s = floor(p + dot(p, vec3(F3)));
	 vec3 x = p - s + dot(s, vec3(G3));
	 
	 /* calculate i1 and i2 */
	 vec3 e = step(vec3(0.0), x - x.yzx);
	 vec3 i1 = e*(1.0 - e.zxy);
	 vec3 i2 = 1.0 - e.zxy*(1.0 - e);
	 	
	 /* x1, x2, x3 */
	 vec3 x1 = x - i1 + G3;
	 vec3 x2 = x - i2 + 2.0*G3;
	 vec3 x3 = x - 1.0 + 3.0*G3;
	 
	 /* 2. find four surflets and store them in d */
	 vec4 w, d;
	 
	 /* calculate surflet weights */
	 w.x = dot(x, x);
	 w.y = dot(x1, x1);
	 w.z = dot(x2, x2);
	 w.w = dot(x3, x3);
	 
	 /* w fades from 0.6 at the center of the surflet to 0.0 at the margin */
	 w = max(0.6 - w, 0.0);
	 
	 /* calculate surflet components */
	 d.x = dot(random3(s), x);
	 d.y = dot(random3(s + i1), x1);
	 d.z = dot(random3(s + i2), x2);
	 d.w = dot(random3(s + 1.0), x3);
	 
	 /* multiply d by w^4 */
	 w *= w;
	 w *= w;
	 d *= w;
	 
	 /* 3. return the sum of the four surflets */
	 return dot(d, vec4(52.0)) + .25;
}


vec2 pong(vec2 value, float pong_value) {
    vec2 v = mod(value, pong_value * 2.0);
    return min(v, pong_value * 2.0 - v);
}

void main(void) {

    // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = v_texCoord;

    uv *= 1. + .05 * sin(u_time * .03 + .2);
    float a = .06 * sin(u_time * 0.08 + .32) + .43;
    float ca = cos(a);
    float sa = sin(a);
    uv = mat2(ca,sa,-sa,ca) * uv;

    uv = pong(uv, .3 + sin(u_time * .02) * .03);
    // uv.x += sin(u_time * .17 + .3) * .1;

    uv.x += u_time * 0.01 * cos(log(u_time) + .4);
    uv.y += u_time * 0.01 * sin(log(u_time) + .4);
    //float noise = texture(iChannel0, uv).x;
    float noise = simplex3d(vec3(uv * 10.0, u_time*0.21));

    // Output to screen
    FragColor = vec4(mix(vec3(.1843, .3098, .3098), vec3(.149, .2471, .2471), noise), 1.0);
}`;

export class BackgroundEffect extends Effect {
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
            "u_time": { type: Effect.UniformTypes.Float, bind: "u_time" },
            "u_aspect_ratio": { type: Effect.UniformTypes.Float, bind: "u_aspect_ratio" },
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