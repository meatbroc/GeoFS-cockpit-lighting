function findQsPrimitiveIndex() {
    return geofs.api.viewer.scene.primitives._primitives.findIndex(
        primitive => 
            primitive._primitives &&
            Array.isArray(primitive._primitives) &&
            primitive.show === true                // Additional condition
    );
}
const qsIndex = findQsPrimitiveIndex();
function findCockpitIndex() {
    return geofs.api.viewer.scene.primitives._primitives[qsIndex]._primitives.findIndex(
        primitive => 
            primitive._resource._url.toString().includes('cockpit')   // Additional condition
    );
}
const cockpitIndex = findCockpitIndex()
function applyCustomShaders() {
    const cockpitPrimitive = geofs.api.viewer.scene.primitives._primitives[4]._primitives[2];

    if (!cockpitPrimitive) {
        console.error("Cockpit primitive not found.");
        return;
    }

    // Vertex shader
    cockpitPrimitive._vertexShaderLoaded = (vertexShader) => {
        return `
        precision highp float;

        attribute vec3 a_position;
        attribute vec3 a_normal;
        attribute vec2 a_texcoord0;

        varying vec3 v_normal;
        varying vec2 v_texcoord0;

        uniform mat4 u_modelViewMatrix;
        uniform mat4 u_projectionMatrix;

        void main(void) {
            v_normal = normalize((u_modelViewMatrix * vec4(a_normal, 0.0)).xyz);
            v_texcoord0 = a_texcoord0;

            gl_Position = u_projectionMatrix * u_modelViewMatrix * vec4(a_position, 1.0);
        }
        `;
    };

    // Fragment shader
    cockpitPrimitive._fragmentShaderLoaded = (fragmentShader) => {
        return `
        precision highp float;

        varying vec3 v_normal;
        varying vec2 v_texcoord0;

        uniform sampler2D u_ambient;
        uniform sampler2D u_diffuse;
        uniform vec4 u_emission;
        uniform vec4 u_specular;
        uniform float u_shininess;

        void main(void) {
            vec3 normal = normalize(v_normal);
            vec4 color = vec4(0.0, 0.0, 0.0, 0.0);
            vec4 diffuse = vec4(0.0, 0.0, 0.0, 1.0);
            vec4 emission;
            vec4 ambient;
            vec4 specular;

            ambient = texture2D(u_ambient, v_texcoord0);
            diffuse = texture2D(u_diffuse, v_texcoord0);
            emission = u_emission;
            specular = u_specular;

            diffuse.xyz *= max(dot(normal, vec3(0.0, 0.0, 1.0)), 0.0);
            color.xyz += diffuse.xyz;
            color.xyz += emission.xyz;

            color = vec4(color.rgb * vec3(1.0, 0.0, 0.0), diffuse.a);

            gl_FragColor = color;
        }
        `;
    };

    cockpitPrimitive._shouldRegenerateShaders = true;
    console.log("shaders applied");
}

// Apply the custom shaders
applyCustomShaders();
