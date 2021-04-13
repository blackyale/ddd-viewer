
import * as BABYLON from 'babylonjs';
import * as BABYLONMAT from 'babylonjs-materials';
import 'babylonjs-loaders';

/* eslint-disable no-unused-vars, no-var, no-undef, no-debugger, no-console,  */

class TerrainMaterialWrapper {

    // From: https://forum.babylonjs.com/t/pbr-texture-splatting-up-to-64-textures/1994/28
    //  and: https://www.babylonjs-playground.com/#LIVRIY#58

    constructor(scene, splatmap, atlas, options) {
        this.material = null;
        this.testSplatMaterial(scene);
        //this.initSplatMaterial(scene, splatmap, atlas, options);
    }

    testSplatMaterial(scene) {

        //var splatmap = new BABYLON.Texture("https://raw.githubusercontent.com/RaggarDK/Baby/baby/mix6.png", scene);
        var splatmap = new BABYLON.Texture("http://localhost:8000/cache/ddd_godot_osm/17/62358/48541.splatmap-4chan-0_3-256.png", scene);
        var atlas = new BABYLON.Texture("https://raw.githubusercontent.com/RaggarDK/Baby/baby/atlas3.jpg", scene);

        /*
        var options = {
            numTilesHorizontal:4.0,
            numTilesVertical:4,
            numSplatTilesHorizontal:2,
            numSplatTilesVertical:2,
            splatInfos:[
                {positions:[
                    [1.0,1.0],[1.0,2.0],[1.0,3.0]
                    ],
                scales:[[10.0,10.0],[10.0,10.0],[10.0,10.0]]
                },
                {positions:[
                    [1.0,4.0],[2.0,1.0],[2.0,2.0]
                    ],
                scales:[[10.0,10.0],[10.0,10.0],[10.0,10.0]]
                },
                {positions:[
                    [2.0,3.0],[2.0,4.0],[3.0,1.0]
                    ],
                scales:[[10.0,10.0],[10.0,10.0],[10.0,10.0]]
                },
                {positions:[
                    [3.0,2.0],[3.0,4.0],[4.0,3.0]
                    ],
                scales:[[10.0,10.0],[10.0,10.0],[10.0,10.0]]
                }
            ]
        };
        */

        this.initSplatMaterial(scene, splatmap, atlas);

    }


    initSplatMaterial(scene, splatMap, atlas, options) {

        var that = this;
        if (!options){
            options = {
                numTilesHorizontal: 4,
                numTilesVertical: 4,
                numSplatTilesHorizontal:1,
                numSplatTilesVertical:1,
                tileScale:[[20.0,20.0],[20.0,20.0],[20.0,20.0]],
                splatInfos:[
                    {positions:[
                        [0.0,2.0],[1.0,2.0],[1.0,3.0]
                        ],
                    scales:[[10.0,10.0],[10.0,10.0],[10.0,10.0]]
                    },
                    {positions:[
                        [1.0,4.0],[2.0,1.0],[2.0,2.0]
                        ],
                    scales:[[10.0,10.0],[10.0,10.0],[10.0,10.0]]
                    },
                    {positions:[
                        [2.0,3.0],[2.0,4.0],[3.0,1.0]
                        ],
                    scales:[[10.0,10.0],[10.0,10.0],[10.0,10.0]]
                    },
                    {positions:[
                        [3.0,2.0],[3.0,4.0],[4.0,1.0]
                        ],
                    scales:[[10.0,10.0],[10.0,10.0],[10.0,10.0]]
                    }
                ]
            };
        }
        this.options = options;
        this.tileIndexes = [];
        this.shaderinjectpoint1 = '';
        this.shaderinjectpoint2 = '';
        this.shaderinjectpoint3 = '';

        //4x4 = 16
        this.numTilesHorizontal = options.numTilesHorizontal;
        this.numTilesVertical = options.numTilesVertical;
        this.totalTiles = this.numTilesVertical*this.numTilesHorizontal;
        this.tileScale = new BABYLON.Vector2(1.0/this.numTilesHorizontal,1.0/this.numTilesVertical);

        //2x2 = 4
        this.numSplatTilesHorizontal = options.numSplatTilesHorizontal;
        this.numSplatTilesVertical = options.numSplatTilesVertical;
        this.totalSplatTiles = this.numSplatTilesVertical*this.numSplatTilesHorizontal;
        this.splatScale = new BABYLON.Vector2(1.0/this.numSplatTilesHorizontal,1.0/this.numSplatTilesVertical);

        this.shaderinjectpoint1 += 'vec2 splatScale = vec2('+this.splatScale.x+','+this.splatScale.y+');\r\n';
        this.shaderinjectpoint1 += 'vec2 scale = vec2('+this.tileScale.x+','+this.tileScale.y+');\r\n';

        var v = 1.0, h = 1.0;
        for(let i=0;i<this.totalSplatTiles;i++){

            if(i < this.totalSplatTiles-1){
                 this.shaderinjectpoint3 += 'baseColor'+(i+2)+' = baseColor'+(i+1)+' * baseColor'+(i+1)+'.a + baseColor'+(i+2)+' * (1.0 - baseColor'+(i+1)+'.a);\r\n';
            }

            if(h > this.numSplatTilesHorizontal){
                v++;
                h = 1.0;
            }

            this.shaderinjectpoint2 += 'vec2 uv'+(i+1)+' = vec2((vAlbedoUV.x + '+v+'.0) * splatScale.x, (vAlbedoUV.y * splatScale.y) + '+h+'.0 * splatScale.y);\r\n';
            this.shaderinjectpoint2 += 'vec4 baseColor'+(i+1)+' = col(vAlbedoUV, uv'+(i+1)+', vec2('+this.options.splatInfos[i].scales[0][0]+','+this.options.splatInfos[i].scales[0][1]+'), vec2('+this.options.splatInfos[i].scales[1][0]+','+this.options.splatInfos[i].scales[1][1]+'), vec2('+this.options.splatInfos[i].scales[2][0]+','+this.options.splatInfos[i].scales[2][1]+'), vec2('+this.options.splatInfos[i].positions[0][0]+','+this.options.splatInfos[i].positions[0][1]+'), vec2('+this.options.splatInfos[i].positions[1][0]+','+this.options.splatInfos[i].positions[1][1]+'), vec2('+this.options.splatInfos[i].positions[2][0]+','+this.options.splatInfos[i].positions[2][1]+'), scale, splatmap, albedoSampler);\r\n';

            h++;
        }

        this.shaderinjectpoint3 += 'result = baseColor'+this.totalSplatTiles+'.rgb;';

        this.splatMap = splatMap;

        this.needsUpdating = true;

        this.material = new BABYLONMAT.PBRCustomMaterial("splatMaterial", scene);
        this.material.metallic = 0.04;
        this.material.roughness = 0.95;

        this.material.albedoTexture = atlas;
        this.material.AddUniform('splatmap','sampler2D');


        this.material.Fragment_Begin(
             "precision highp float;\r\n"
            +"precision highp int;\r\n"

            +this.shaderinjectpoint1

            +"vec4 col(vec2 vAlbedoUV, vec2 uvT, vec2 tile1Scale, vec2 tile2Scale, vec2 tile3Scale, vec2 tile1Position, vec2 tile2Position, vec2 tile3Position, vec2 scale, sampler2D splatmap, sampler2D atlas){"
                +'vec2 scaledUv1 = fract(vAlbedoUV * tile1Scale);'
                +'vec2 uv1 = vec2((scaledUv1.x + tile1Position.x) * scale.x, (scaledUv1.y * scale.y) + tile1Position.y * scale.y);'
                +'vec4 baseColor1 = texture2D(splatmap, uvT);\r\n'

                +'vec2 scaledUv2 = fract(vAlbedoUV * tile2Scale);'
                +'vec2 uv2 = vec2((scaledUv2.x + tile2Position.x) * scale.x, (scaledUv2.y * scale.y) + tile2Position.y * scale.y);'

                +'vec2 scaledUv3 = fract(vAlbedoUV * tile3Scale);'
                +'vec2 uv3 = vec2((scaledUv3.x + tile3Position.x) * scale.x, (scaledUv3.y * scale.y) + tile3Position.y * scale.y);'

                +'vec4 diffuse1Color = texture2D(atlas, uv1);\r\n'
                +'vec4 diffuse2Color = texture2D(atlas, uv2);\r\n'
                +'vec4 diffuse3Color = texture2D(atlas, uv3);\r\n'
                +'diffuse1Color.rgb *= (baseColor1.r + baseColor1.g);\r\n'
                +'diffuse2Color.rgb = mix(diffuse1Color.rgb, diffuse2Color.rgb, baseColor1.b);\r\n'
                +'baseColor1.rgb = mix(diffuse2Color.rgb, diffuse3Color.rgb, baseColor1.a);'

                +"return baseColor1;"
            +"}"
        );

        this.material.Fragment_MainBegin(
            this.shaderinjectpoint2
        );

        this.material.Fragment_Custom_Albedo(
            this.shaderinjectpoint3
        );

        this.material.onBindObservable.add(function () {
            that.update();
        });

        return this.material;
    }

    update = function(){
        this.material.getEffect().setTexture('splatmap',this.splatMap);
    }

}

export default TerrainMaterialWrapper;
