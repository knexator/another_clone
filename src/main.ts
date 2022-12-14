import Shaku from "shaku/lib/shaku";
import TextureAsset from "shaku/lib/assets/texture_asset";
import Sprite from "shaku/lib/gfx/sprite";
import Vector2 from "shaku/lib/utils/vector2";
import Color from "shaku/lib/utils/color";
import Rectangle from "shaku/lib/utils/rectangle";
import { KeyboardKeys, MouseButtons } from "shaku/lib/input/key_codes";
import { BlendModes } from "shaku/lib/gfx/blend_modes";
import { TextureFilterModes } from "shaku/lib/gfx/texture_filter_modes";
import { TextAlignment, TextAlignments } from "shaku/lib/gfx/text_alignments";
import { BackgroundEffect } from "./background_effect";
// import { level_1 } from "./levels";
import { kalbakUpdate, doOnceOnTrue, doEveryFrameUntilTrue } from "./kalbak";
import memoize from "lodash.memoize";
import * as dat from 'dat.gui';
import MsdfFontTextureAsset from "shaku/lib/assets/msdf_font_texture_asset";
import GameTime from "shaku/lib/utils/game_time";
import Animator from "shaku/lib/utils/animator";
import { BarEffect } from "./bar_effect";
import { TransitionEffect } from "./transition_effect";

// all queued turns wont take any longer than turn_duration / power_thing
let power_thing = 1 / 4.0;
let max_miniturns = 2.5;
let miniturn_duration = 0.15;
let margin_fraction = 0.40;
const TILE_SIZE = 50;
const SYMBOL_SIZE = 50;
const EXIT_TIME = .6;

const CONFIG: {
    time: "MANUAL" | "SEMI" | "AUTO",
    instant_reset: boolean,
} = {
    time: "MANUAL",
    instant_reset: true,
};
let gui = new dat.GUI({});
gui.remember(CONFIG);
gui.add(CONFIG, "time", ["MANUAL", "SEMI", "AUTO"]);
gui.add(CONFIG, "instant_reset");
gui.hide();

Shaku!.input!.setTargetElement(() => Shaku.gfx!.canvas);
await Shaku.init();

// add shaku's canvas to document and set resolution to 800x600
document.body.appendChild(Shaku!.gfx!.canvas);
Shaku.gfx!.setResolution(800, 600, true);
// Shaku.gfx!.setResolution(1152, 648, true);
Shaku.gfx!.centerCanvas();
// Shaku.gfx!.maximizeCanvasSize(false, false);

// Pre loading
Shaku.startFrame();
Shaku.gfx!.clear(Shaku.utils.Color.darkslategray);
Shaku.endFrame();

// let game_size = new Vector2(800, 400);
let game_size = new Vector2(800, 430);

let muted = false;
let background_paused = false;

const COLOR_LOGO = Color.fromHex("#47B2CE");

let generateText = memoize((text: string, x: number, y: number, size: number = 32, color: Color = Color.white, aligment: TextAlignment = TextAlignments.Center, font: MsdfFontTextureAsset = instructions_font) => {
    console.log("building text");
    let group = Shaku.gfx.buildText(font, text, size, color, aligment);
    group.position.set(x, y);
    return group;
}, (text, x, y) => text + x.toString() + y.toString());

// @ts-ignore
const instructions_font = Shaku.assets.loadMsdfFontTexture('fonts/Arial.ttf', { jsonUrl: 'fonts/Arial.json', textureUrl: 'fonts/Arial.png' }).asset;
// @ts-ignore
const logo_font = Shaku.assets.loadMsdfFontTexture('fonts/BowlbyOne-Regular.ttf', { jsonUrl: 'fonts/BowlbyOne-Regular.json', textureUrl: 'fonts/BowlbyOne-Regular.png' }).asset;

await Shaku.assets.waitForAll();

const LOWER_SCREEN_SPRITE = new Sprite(Shaku.gfx.whiteTexture);
LOWER_SCREEN_SPRITE.origin = Vector2.zero;
LOWER_SCREEN_SPRITE.size.set(800, 600 - game_size.y);
LOWER_SCREEN_SPRITE.position.set(0, game_size.y);
LOWER_SCREEN_SPRITE.color = Color.fromHex("#2B849C")

const MID_LINE_SPRITE = new Sprite(Shaku.gfx.whiteTexture);
MID_LINE_SPRITE.origin = Vector2.zero;
MID_LINE_SPRITE.size.set(800, 8);
MID_LINE_SPRITE.position.set(0, game_size.y);
MID_LINE_SPRITE.color = Color.fromHex("#12679B");

let logo_group_1 = generateText("Another", 400, 10, 136, COLOR_LOGO, TextAlignments.Center, logo_font);
let logo_group_2 = generateText("Clone", 400, 136, 136, COLOR_LOGO, TextAlignments.Center, logo_font);
const logo_loading_group = generateText("Loading...", 400, 490, 48, Color.white, TextAlignments.Center, instructions_font)

// Loading screen
Shaku.startFrame();
Shaku.gfx!.clear(Shaku.utils.Color.darkslategray);
Shaku.gfx.drawSprite(LOWER_SCREEN_SPRITE);
Shaku.gfx.drawSprite(MID_LINE_SPRITE);

Shaku.gfx.useEffect(Shaku.gfx.builtinEffects.MsdfFont);
Shaku.gfx.drawGroup(logo_group_1, false);
Shaku.gfx.drawGroup(logo_group_2, false);
Shaku.gfx.drawGroup(logo_loading_group, false);

Shaku.endFrame();

const logo_start_group = generateText("Press any key to start", 400, 490, 48, Color.white, TextAlignments.Center, instructions_font);

// @ts-ignore
const storage = new Shaku.utils.Storage();

const menu_row_size = 6;
const menu_button_spacing = 125;
const menu_button_size = 100;
const menu_off_x = (game_size.x - menu_button_spacing * (menu_row_size - 1) - menu_button_size) * .5;
const menu_off_y = (game_size.y - menu_button_spacing * 2 - menu_button_size) * .5;

// await new Promise(r => setTimeout(r, 2000)); // to test loading screen

// @ts-ignore
const dirs_texture = Shaku.assets.loadTexture("imgs/directions.png", { generateMipMaps: true }).asset;
// @ts-ignore
const space_texture = Shaku.assets.loadTexture("imgs/spacebar.png", { generateMipMaps: true }).asset;
// @ts-ignore
const undo_texture = Shaku.assets.loadTexture("imgs/undo_redo.png", { generateMipMaps: true }).asset;
// @ts-ignore
const mute_texture = Shaku.assets.loadTexture("imgs/mute.png", { generateMipMaps: true }).asset;
// @ts-ignore
const reset_texture = Shaku.assets.loadTexture("imgs/reset.png", { generateMipMaps: true }).asset;

// @ts-ignore
const player_texture = Shaku.assets.loadTexture("imgs/player.png", { generateMipMaps: true }).asset;
// @ts-ignore
const player_gray_texture = Shaku.assets.loadTexture("imgs/player_gray.png", { generateMipMaps: true }).asset;
// @ts-ignore
const crate_texture = Shaku.assets.loadTexture("imgs/crate.png", { generateMipMaps: true }).asset;
// @ts-ignore
const target_texture = Shaku.assets.loadTexture("imgs/target.png", { generateMipMaps: true }).asset;
// @ts-ignore
const button_texture = Shaku.assets.loadTexture("imgs/button.png", { generateMipMaps: true }).asset;
// const two_state_wall_texture =  Shaku.assets.loadTexture("imgs/two_state_wall.png", { generateMipMaps: true }).asset;
// @ts-ignore
const particle_crate_texture = Shaku.assets.loadTexture("imgs/particle_crate.png", { generateMipMaps: true }).asset;
// @ts-ignore
const geo_texture = Shaku.assets.loadTexture("imgs/geo.png", { generateMipMaps: true }).asset;
// @ts-ignore
const spawner_texture = Shaku.assets.loadTexture("imgs/spawner.png", { generateMipMaps: true }).asset;
// @ts-ignore
const floors_texture = Shaku.assets.loadTexture("imgs/floors.png", { generateMipMaps: true }).asset;
// @ts-ignore
const left_arrow_texture = Shaku.assets.loadTexture("imgs/left_arrow.png", { generateMipMaps: true }).asset;
// @ts-ignore
const none_texture = Shaku.assets.loadTexture("imgs/wait.png", { generateMipMaps: true }).asset;
// @ts-ignore
const tape_borders_texture = Shaku.assets.loadTexture("imgs/tape_borders.png", { generateMipMaps: true }).asset;
// @ts-ignore
let icons_texture = Shaku.assets.loadTexture("icons/all.png").asset;
// @ts-ignore
let icon_back_texture = Shaku.assets.loadTexture("icons/icon_back.png").asset;
// @ts-ignore
let icon_border_texture = Shaku.assets.loadTexture("icons/icon_border.png").asset;
// @ts-ignore
let stepSoundSrc = Shaku.assets.loadSound('sounds/step.wav').asset;
// @ts-ignore
let pushSoundSrc = Shaku.assets.loadSound('sounds/push.wav').asset;
// @ts-ignore
let wallSoundSrc = Shaku.assets.loadSound('sounds/wall.wav').asset;
// @ts-ignore
let onTargetSoundSrc = Shaku.assets.loadSound('sounds/onTarget.wav').asset;
// @ts-ignore
let offTargetSoundSrc = Shaku.assets.loadSound('sounds/offTarget.wav').asset;

await Shaku.assets.waitForAll();

const dirs_sprite = new Sprite(dirs_texture, new Rectangle(0, 0, 150, 100));
const space_sprite = new Sprite(space_texture);
const undo_sprite = new Sprite(undo_texture, new Rectangle(0, 0, 200, 50));
const mute_sprite = new Sprite(mute_texture, new Rectangle(0, 50, 100, 50));
mute_sprite.position.set(725, 550);
const reset_sprite = new Sprite(reset_texture);
reset_sprite.position.set(600, 550);

// player_texture.filter = TextureFilterModes.LinearMipmapLinear;
const player_sprite = new Sprite(player_texture);
player_sprite.size.set(TILE_SIZE, TILE_SIZE);
// player_gray_texture.filter = TextureFilterModes.LinearMipmapLinear;
const player_gray_sprite = new Sprite(player_gray_texture);
player_gray_sprite.size.set(TILE_SIZE, TILE_SIZE);
// crate_texture.filter = TextureFilterModes.LinearMipmapLinear;
const crate_sprite = new Sprite(crate_texture);
crate_sprite.size.set(TILE_SIZE, TILE_SIZE);
// target_texture.filter = TextureFilterModes.LinearMipmapLinear;
const target_sprite = new Sprite(target_texture);
target_sprite.size.set(TILE_SIZE, TILE_SIZE);
// button_texture.filter = TextureFilterModes.LinearMipmapLinear;
const button_sprite = new Sprite(button_texture);
button_sprite.size.set(TILE_SIZE, TILE_SIZE);
// two_state_wall_texture.filter = TextureFilterModes.LinearMipmapLinear;
// spawner_texture.filter = TextureFilterModes.LinearMipmapLinear;
const spawner_sprite = new Sprite(spawner_texture);
spawner_sprite.size.set(TILE_SIZE, TILE_SIZE);

// spawner_texture.filter = TextureFilterModes.LinearMipmapLinear;

// geo_texture.filter = TextureFilterModes.LinearMipmapLinear;
const geo_sprite = new Sprite(geo_texture, new Rectangle(0, 0, TILE_SIZE, TILE_SIZE));

// floors_texture.filter = TextureFilterModes.LinearMipmapLinear;


// left_arrow_texture.filter = TextureFilterModes.LinearMipmapLinear;
const left_arrow = new Sprite(left_arrow_texture);
left_arrow.size.set(SYMBOL_SIZE, SYMBOL_SIZE);

// none_texture.filter = TextureFilterModes.LinearMipmapLinear;
const none_sprite = new Sprite(none_texture);
none_sprite.size.set(SYMBOL_SIZE, SYMBOL_SIZE);

const tape_border_left = new Sprite(tape_borders_texture, new Rectangle(0, 0, SYMBOL_SIZE / 2, SYMBOL_SIZE * 1.5));
tape_border_left.origin.set(0, 0);
tape_border_left.position.set(-SYMBOL_SIZE / 2, 0);
const tape_border = new Sprite(tape_borders_texture, new Rectangle(SYMBOL_SIZE / 2, 0, SYMBOL_SIZE, SYMBOL_SIZE * 1.5));
tape_border.origin.set(0, 0);
const tape_border_right = new Sprite(tape_borders_texture, new Rectangle(SYMBOL_SIZE * 1.5, 0, SYMBOL_SIZE / 2, SYMBOL_SIZE * 1.5));
tape_border_right.origin.set(0, 0);

const icon_back = new Sprite(icon_back_texture);
const icon_border = new Sprite(icon_border_texture);
icon_border.color = Color.fromHex("#6D6D6D");

const COLOR_TAPE = Color.fromHex("#E5B35B");
const COLOR_TAPE_DELAY = Color.fromHex("#f5ca7f");
const COLOR_HIGH = Color.fromHex("#99F3ED");
const COLOR_LOW = Color.fromHex("#6AC2BC");
const COLOR_SYMBOL = Color.fromHex("#B84B4B");
const COLOR_BRIGHT = new Color(1.3, 1.3, 1.3, 1);

const tape_high = new Sprite(Shaku.gfx.whiteTexture);
tape_high.origin = new Vector2(0, -8 / (SYMBOL_SIZE * 1.5));
tape_high.size.set(SYMBOL_SIZE, SYMBOL_SIZE * 1.5 - 16);
tape_high.color = COLOR_HIGH;

const tape_low = new Sprite(Shaku.gfx.whiteTexture);
tape_low.origin = new Vector2(0, -8 / (SYMBOL_SIZE * 1.5));
tape_low.size.set(SYMBOL_SIZE, SYMBOL_SIZE * 1.5 - 16);
tape_low.color = COLOR_LOW;

// let stepSound = await Shaku.sfx.createSound(stepSoundSrc);
// let pushSound = await Shaku.sfx.createSound(pushSoundSrc);
// let wallSound = await Shaku.sfx.createSound(wallSoundSrc);
// let onTargetSound = await Shaku.sfx.createSound(onTargetSoundSrc);
// let offTargetSound = await Shaku.sfx.createSound(offTargetSoundSrc);

type Particle = ParticleCrate | ParticleBump;

class ParticleCrate {
    public sprite: Sprite;
    constructor(
        public pos: Vector2,
        public time: number,
    ) {
        this.sprite = new Sprite(particle_crate_texture, new Rectangle(0, 0, TILE_SIZE * 2, TILE_SIZE * 2));
        this.sprite.position.copy(this.pos.add(1, 1).mul(TILE_SIZE));
    }

    draw() {
        let t = (Shaku.gameTime.elapsed - this.time) / .15 - .05;
        if (t <= 0) return;
        if (t >= 1) {
            particles = particles.filter(x => x !== this);
            return;
        }
        t = Math.floor(t * 9);
        this.sprite.setSourceFromSpritesheet(
            new Vector2(t % 3, Math.floor(t / 3)),
            new Vector2(3, 3),
        )
        Shaku.gfx.drawSprite(this.sprite);
    }
}

class ParticleBump {
    public sprite: Sprite;
    constructor(
        public pos: Vector2,
        public time: number,
    ) {
        this.sprite = new Sprite(particle_crate_texture, new Rectangle(0, 0, TILE_SIZE * 2, TILE_SIZE * 2));
        this.sprite.position.copy(this.pos.add(1, 1).mul(TILE_SIZE));
    }

    draw() {
        let t = (Shaku.gameTime.elapsed - this.time) / .10 - .02;
        if (t <= 0) return;
        if (t >= 1) {
            particles = particles.filter(x => x !== this);
            return;
        }
        t = Math.floor(t * 9);
        this.sprite.setSourceFromSpritesheet(
            new Vector2(t % 3, Math.floor(t / 3)),
            new Vector2(3, 3),
        )
        this.sprite.size.mulSelf(.5);
        Shaku.gfx.drawSprite(this.sprite);
    }
}

class Level {
    constructor(
        public dev_name: string,
        public public_name: string,
        public n_moves: number,
        public n_delay: number,
        public initial_state: GameState,
    ) {
        initial_state.wall.recalcFloors(initial_state.spawner.pos);
    }
}

class GameState {
    public empty: boolean;
    public someChanges: boolean;
    public won: boolean;
    /** not defined for miniturn == 0 */
    public miniturn_siblings_count: number;
    constructor(
        public major_turn: number,
        public minor_turn: number,
        public things: GameObject[],
    ) {
        this.empty = false;
        this.someChanges = true;
        this.won = false;
        this.miniturn_siblings_count = -1;
    }

    draw(turn_time: number) {
        // console.log(time_offset);
        this.things.forEach(x => x.draw(turn_time));
        this.spawner.draw(turn_time); // hacky
    }

    playSounds(turn_duration: number) {
        if (muted) return;
        // let any_player_moved = this.players.some(p => p.pos)
        // this.things.forEach(x => x.playSound(turn_time));
        if (this.minor_turn <= 0) return;
        let turn_active_player = this.players[this.minor_turn - 1];
        if (!turn_active_player || !turn_active_player.previous) return;
        if (turn_active_player.previous.pos.equals(turn_active_player.pos)) {
            if (turn_active_player.wall_crashed()) {
                // wall bump
                // wallSound.play();
                Shaku.sfx.play(wallSoundSrc, Math.pow(.6, turn_active_player.index), 1.0, true);
                particles.push(new ParticleBump(turn_active_player.pos.add(turn_active_player.dir.mul(.5)), Shaku.gameTime.elapsed));
            } else {
                // waited
            }
        } else {
            // step
            // stepSound.play();            
            Shaku.sfx.play(stepSoundSrc, 1.5 * Math.pow(.6, turn_active_player.index), 1.0, true);
            // console.log("step sound")
        }
        let any_pushed = this.things.some(x => {
            if (!(x instanceof Pushable)) return false;
            if (x === turn_active_player) return false;
            if (!x.previous) return false;
            return !x.previous.pos.equals(x.pos);
        })
        if (any_pushed) {
            Shaku.sfx.play(pushSoundSrc, .6 * Math.pow(.6, turn_active_player.index), 1.0, true);
        }
        let target = this.target;
        let crates = this.crates;
        let crates_on = this.crates.filter(c => {
            return c.previous && !c.previous.pos.equals(c.pos) && this.target.posAt(c.pos);
        })
        let any_crate_off = this.crates.some(c => {
            return c.previous && !c.previous.pos.equals(c.pos) && this.target.posAt(c.previous.pos);
        })
        if (crates_on.length > 0) {
            // todo: use sound instances
            Shaku.sfx.play(onTargetSoundSrc, .7, 1.0, true);

            crates_on.forEach(c => {
                particles.push(new ParticleCrate(c.pos, Shaku.gameTime.elapsed))
            })
        }
        if (any_crate_off) {
            // todo: use sound instances
            Shaku.sfx.play(offTargetSoundSrc, .65, 1.0, true);
        }
    }

    public get wall(): Walls {
        let res = this.things.filter(x => x instanceof Walls);
        if (res.length === 0) throw new Error("no walls!");
        if (res.length > 1) throw new Error("too many walls!");
        return res[0] as Walls;
    }

    public get target(): Targets {
        let res = this.things.filter(x => x instanceof Targets);
        if (res.length === 0) throw new Error("no Targets!");
        if (res.length > 1) throw new Error("too many Targets!");
        return res[0] as Targets;
    }

    public get spawner(): Spawner {
        let res = this.things.filter(x => x instanceof Spawner);
        if (res.length === 0) throw new Error("no Spawner!");
        if (res.length > 1) throw new Error("too many Spawner!");
        return res[0] as Spawner;
    }

    public get players(): Player[] {
        return this.things.filter(x => x instanceof Player) as Player[];
    }

    public get crates(): Crate[] {
        return this.things.filter(x => x instanceof Crate) as Crate[];
    }

    public get buttons(): Button[] {
        return this.things.filter(x => x instanceof Button) as Button[];
    }

    public get buttonTargets(): ButtonTarget[] {
        return this.things.filter(x => x instanceof ButtonTarget) as ButtonTarget[];
    }

    nextStates(): GameState[] {
        if (this.minor_turn !== 0) throw new Error("this method should only be called on main states");

        let result: GameState[] = [];
        let cur_state: GameState = this;

        for (let k = 0; k < cur_state.players.length; k++) {
            // move player of index k
            if (cur_state.players[k].age >= robot_tape.length) continue;
            cur_state = new GameState(cur_state.major_turn, k + 1, cur_state.things.map(x => x.clone()));
            let new_player = cur_state.players[k];
            if (new_player.index !== k) {
                console.log("cur_state.players:", cur_state.players);
                console.log("new_player.index:", new_player.index);
                console.log("this.minor_turn:", this.minor_turn);
                throw new Error("new_player index is wrong! time to use the other way");
            }
            let action = robot_tape[new_player.age];
            let direction = selectFromEnum([
                [TAPE_SYMBOL.LEFT, Vector2.left],
                [TAPE_SYMBOL.RIGHT, Vector2.right],
                [TAPE_SYMBOL.UP, Vector2.up],
                [TAPE_SYMBOL.DOWN, Vector2.down],
            ], action)
            if (direction !== null) {
                cur_state.move(new_player.pos, direction);
                new_player.dir = direction;
            }
            new_player.age += 1;
            result.push(cur_state);
        }

        if ((this.major_turn + 1) % robot_delay === 0) {
            // spawn new player
            cur_state = new GameState(cur_state.major_turn, cur_state.minor_turn + 1, cur_state.things.map(x => x.clone()));
            let spawn_dir = cur_state.spawner.dir;
            let spawn_pos = cur_state.spawner.pos.add(spawn_dir);
            if (cur_state.move(spawn_pos, spawn_dir)) {
                cur_state.things.push(new Player(
                    spawn_pos,
                    spawn_dir.clone(),
                    cur_state.players.length,
                    0,
                    cur_state.spawner as Player // hacky
                ));
            }
            result.push(cur_state);
        }

        for (let button_id = 0; button_id < cur_state.buttons.length; button_id++) {
            // update button states
            let cur_button = cur_state.buttons[button_id];
            let { value, prev_value } = cur_button.update(cur_state)
            for (const target_id of cur_button.target_ids) {
                result = result.concat(cur_state.buttonTargets[target_id].mainUpdate(cur_state, value, prev_value));
                if (result.length > 0) {
                    cur_state = result.at(-1)!;
                }
            }
        }

        // let last = result.at(-1);
        // if (last) {
        //     last.minor_turn = 0;
        //     last.major_turn += 1;
        // }
        let filler_state = new GameState(cur_state.major_turn + 1, 0, cur_state.things.map(x => x.clone()));
        filler_state.empty = true;
        result.forEach(x => {
            x.miniturn_siblings_count = result.length;
        });
        filler_state.someChanges = result.length > 0;
        result.push(filler_state);
        filler_state.won = filler_state.isWon();
        return result;
    }

    move(pos: Vector2, dir: Vector2): boolean {
        return this.things.every(x => x.move(this, pos, dir));
    }

    isWon(): boolean {
        let crates = this.crates;
        let target = this.target;
        return crates.every(c => target.posAt(c.pos));
    }
}

abstract class GameObject {
    public abstract previous: GameObject | null;
    /** turn time goes between 0 (previous turn) and 1 (current turn) */
    abstract draw(turn_time: number): void;
    /** return true if this object has no issue with whatever is at pos being moved in direction */
    abstract move(state: GameState, pos: Vector2, direction: Vector2): boolean;
    abstract clone(): GameObject;
}


class Walls extends GameObject {
    public previous = null;
    public data: boolean[][];
    public floor_data: boolean[][];
    private floor_spr_1: Sprite;
    private floor_spr_2: Sprite;
    constructor(
        public w: number,
        public h: number,
    ) {
        super();
        this.data = makeRectArray(w, h, false);
        this.floor_data = makeRectArray(w, h, false);

        this.floor_spr_1 = new Sprite(floors_texture, new Rectangle(0, 0, TILE_SIZE, TILE_SIZE));
        this.floor_spr_2 = new Sprite(floors_texture, new Rectangle(TILE_SIZE, 0, TILE_SIZE, TILE_SIZE));
    }
    static fromString(ascii: string): Walls {
        let rows = ascii.trim().split("\n").map(x => x.trim())
        let height = rows.length
        let width = rows[0].length

        let result = new Walls(width, height);
        for (let j = 0; j < height; j++) {
            for (let i = 0; i < width; i++) {
                let val = rows[j][i];
                result.data[j][i] = val === '#';
            }
        }
        return result;
    }
    private static n_to_x = []
    draw(turn_time: number): void {
        // todo: don't run these calculations every frame
        for (let i = 0; i <= this.w; i++) {
            for (let j = 0; j <= this.h; j++) {
                let n = this.wallAt(i - 1, j - 1) + this.wallAt(i, j - 1) * 2
                    + this.wallAt(i - 1, j) * 4 + this.wallAt(i, j) * 8;
                if ((i + j) % 2 === 1) {
                    n += 16;
                }
                if (this.floorAt(i - 1, j - 1) || this.floorAt(i, j - 1)
                    || this.floorAt(i - 1, j) || this.floorAt(i, j)) {
                    if ((i + j) % 2 === 1) {
                        this.floor_spr_1.position.set((i + .5) * TILE_SIZE, (j + .5) * TILE_SIZE);
                        Shaku.gfx!.drawSprite(this.floor_spr_1);
                    } else {
                        this.floor_spr_2.position.set((i + .5) * TILE_SIZE, (j + .5) * TILE_SIZE);
                        Shaku.gfx!.drawSprite(this.floor_spr_2);
                    }
                }
                geo_sprite.setSourceFromSpritesheet(new Vector2(n % 4, Math.floor(n / 4)), new Vector2(4, 8), 1, false);
                geo_sprite.position.set((i + .5) * TILE_SIZE, (j + .5) * TILE_SIZE);
                Shaku.gfx!.drawSprite(geo_sprite);
            }
        }
        /*forEachTile(this.data, (isWall, i, j) => {
            if (isWall) {
                wall_sprite.position.set((i + 1) * TILE_SIZE, (j + 1) * TILE_SIZE);
                Shaku.gfx!.drawSprite(wall_sprite);
            }
        });*/
    }
    private wallAtPos(pos: Vector2): boolean {
        if (pos.x < 0 || pos.x >= this.w || pos.y < 0 || pos.y >= this.h) return true;
        if (this.data[pos.y][pos.x]) return true;
        return false;
    }
    private wallAt(i: number, j: number): number {
        if (i < 0 || i >= this.w || j < 0 || j >= this.h) return 0;
        return this.data[j][i] ? 1 : 0;
    }
    private floorAt(i: number, j: number): boolean {
        if (i < 0 || i >= this.w || j < 0 || j >= this.h) return false;
        return this.floor_data[j][i];
    }
    recalcFloors(pos: Vector2) {
        this.floor_data = makeRectArray(this.w, this.h, false);
        let pending: Vector2[] = [pos];
        while (pending.length > 0) {
            let cur = pending.pop()!;
            this.floor_data[cur.y][cur.x] = true;
            for (const dir of [Vector2.up, Vector2.down, Vector2.right, Vector2.left]) {
                let next = cur.add(dir);
                if (this.wallAtPos(next) || this.floorAt(next.x, next.y)) continue;
                pending.push(next);
            }
        }
    }
    move(state: GameState, pos: Vector2, direction: Vector2): boolean {
        return !this.wallAtPos(pos);
    }
    clone(): Walls {
        return this;
    }
    setAt(pos: Vector2, value: boolean) { // editor
        if (pos.x < 0 || pos.x >= this.w || pos.y < 0 || pos.y >= this.h) return;
        this.data[pos.y][pos.x] = value;
    }
}

class Targets extends GameObject {
    public previous = null;
    constructor(
        public positions: Vector2[],
    ) {
        super();
    }
    draw(turn_time: number): void {
        this.positions.forEach(pos => {
            target_sprite.position.set((pos.x + 1) * TILE_SIZE, (pos.y + 1) * TILE_SIZE);
            Shaku.gfx!.drawSprite(target_sprite);
        })
    }
    move(state: GameState, pos: Vector2, direction: Vector2): boolean {
        return true;
    }
    clone(): Targets {
        return this;
    }
    toggleAt(pos: Vector2) { // editor
        let target_index = indexOfTrue(this.positions, x => x.equals(pos));
        if (target_index === -1) {
            this.positions.push(pos);
        } else {
            this.positions.splice(target_index, 1);
        }
    }
    posAt(pos: Vector2): boolean {
        return this.positions.some(p => p.equals(pos));
    }
}

class Button extends GameObject {
    constructor(
        public pos: Vector2,
        public target_ids: number[],
        public active: boolean,
        public previous: Button | null,
    ) { super(); }

    private static ActiveColor = Color.fromHex("#F0A863");
    private static InactiveColor = Color.fromHex("#4E3116");
    draw(turn_time: number): void {
        button_sprite.position.copy(this.pos.add(1, 1).mul(TILE_SIZE));
        if (turn_time !== 1 && this.previous && this.previous.active !== this.active) {
            button_sprite.color = Color.lerp(Button.ActiveColor, Button.InactiveColor, this.active ? turn_time : 1 - turn_time);
        } else {
            button_sprite.color = this.active ? Button.ActiveColor : Button.InactiveColor;
        }
        Shaku.gfx!.drawSprite(button_sprite);
    }

    move(state: GameState, pos: Vector2, direction: Vector2): boolean {
        return true;
    }

    clone(): Button {
        return new Button(this.pos, this.target_ids, this.active, this);
    }

    update(state: GameState): { value: boolean, prev_value: boolean } {
        let pressed = state.crates.some(crate => crate.pos.equals(this.pos))
            || state.players.some(player => player.pos.equals(this.pos))
            || state.spawner.pos.equals(this.pos);
        let prev_active = this.active;
        this.active = pressed;
        return {
            value: this.active,
            prev_value: prev_active,
        }
    }
}

abstract class ButtonTarget extends GameObject {
    abstract mainUpdate(state: GameState, button_active: boolean, button_prev_active: boolean): GameState[];

    remove(state: GameState) { // editor
        let this_index = state.buttonTargets.indexOf(this);
        if (this_index === -1) throw new Error("removing a button target that doesn't exist");
        state.buttons.forEach(button => {
            button.target_ids = button.target_ids.filter(n => n !== this_index).map(n => {
                if (n < this_index) return n;
                return n - 1;
            })
        })
        state.things = state.things.filter(x => x != this);
    }
}


class TwoStateWall extends ButtonTarget {
    // private rail_sprite: Sprite;
    // private wall_sprite: Sprite;
    constructor(
        public pos: Vector2,
        public dir: Vector2,
        public extended: boolean,
        public previous: TwoStateWall | null,
    ) {
        super();
        // this.rail_sprite = new Sprite(two_state_wall_texture, new Rectangle(0, 0, TILE_SIZE * 2, TILE_SIZE));
        // this.rail_sprite.position = pos.add(dir.mul(.5)).add(1, 1).mul(TILE_SIZE);
        // this.rail_sprite.rotation = this.dir.getRadians();

        // this.wall_sprite = new Sprite(two_state_wall_texture, new Rectangle(TILE_SIZE * 2, 0, TILE_SIZE, TILE_SIZE));
        // this.wall_sprite.rotation = this.dir.getRadians();
    };

    mainUpdate(state: GameState, button_active: boolean, button_prev_active: boolean): GameState[] {
        let new_state = new GameState(state.major_turn, state.minor_turn + 1, state.things.map(x => x.clone()));
        if (button_active) {
            // try to extend
            if (new_state.move(this.pos.add(this.dir), this.dir)) {
                let new_this = new_state.things.find(x => x instanceof TwoStateWall && x.pos.equals(this.pos)) as TwoStateWall // hacky
                new_this.extended = true;
                return [new_state];
            }
        } else {
            // try to retract
            if (new_state.move(this.pos, this.dir.mul(-1))) {
                let new_this = new_state.things.find(x => x instanceof TwoStateWall && x.pos.equals(this.pos)) as TwoStateWall // hacky
                new_this.extended = false;
                return [new_state];
            }
        }
        return [];
        // throw new Error("Method not implemented.");
    }

    draw(turn_time: number): void {
        // Shaku.gfx!.drawSprite(this.rail_sprite);

        // let pos = this.extended ? this.pos.add(this.dir) : this.pos;
        // if (this.previous && this.previous.extended != this.extended) {
        //     pos = Vector2.lerp(this.previous.extended ? this.pos.add(this.dir) : this.pos, pos, turn_time);
        // }
        // this.wall_sprite.position.copy(pos.add(1, 1).mul(TILE_SIZE));
        // Shaku.gfx!.drawSprite(this.wall_sprite);
    }

    move(state: GameState, pos: Vector2, direction: Vector2): boolean {
        if (this.extended) {
            return !pos.equals(this.pos.add(this.dir));
        } else {
            return !pos.equals(this.pos);
        }
    }

    clone(): GameObject {
        return new TwoStateWall(this.pos.clone(), this.dir.clone(), this.extended, this);
    }

}


abstract class Pushable extends GameObject {
    public abstract sprite: Sprite;
    constructor(
        public pos: Vector2,
        public previous: Pushable | null,
    ) {
        super();
    };

    draw(turn_time: number) {
        if (turn_time !== 1 && this.previous) {
            // turn_time = clamp(remap(turn_time, .2, 1, 0, 1), 0, 1);
            this.sprite.position.copy(Vector2.lerp(this.previous.pos, this.pos, turn_time).add(1, 1).mul(TILE_SIZE));
        } else {
            this.sprite.position.copy(this.pos.add(1, 1).mul(TILE_SIZE));
        }
        Shaku.gfx!.drawSprite(this.sprite);
    }

    // recursive
    move(state: GameState, pos: Vector2, dir: Vector2): boolean {
        if (!pos.equals(this.pos)) return true;
        let new_pos = pos.add(dir);
        if (state.move(new_pos, dir)) {
            this.pos.copy(new_pos);
            return true;
        }
        return false;
    }
}

class Spawner extends Pushable {
    sprite = spawner_sprite;
    constructor(
        public pos: Vector2,
        public dir: Vector2,
        public previous: Spawner | null,
    ) {
        super(pos, previous);
        this.sprite.rotation = this.dir.getRadians();
    };

    clone(): GameObject {
        return new Spawner(this.pos.clone(), this.dir.clone(), this);
    }
}

class Crate extends Pushable {
    sprite = crate_sprite;
    clone(): Crate {
        return new Crate(this.pos.clone(), this);
    }
}

class Player extends Pushable {
    sprite = player_sprite;
    constructor(
        public pos: Vector2,
        public dir: Vector2,
        public index: number,
        public age: number = 0,
        public previous: Player | null,
    ) { super(pos, previous); };

    draw(turn_time: number): void {
        this.sprite = this.age < robot_tape.length ? player_sprite : player_gray_sprite;

        this.sprite.rotation = this.dir.getRadians() + Math.PI / 2;
        this.sprite.color = (this.index === 0) ? COLOR_BRIGHT : Shaku.utils.Color.white;

        if (turn_time !== 1 && this.previous) {
            // turn_time = clamp(remap(turn_time, .2, 1, 0, 1), 0, 1);
            if (cur_turn === 0 && time_offset < 0) {
                // special first turn
                this.sprite.position.copy(Vector2.lerp(this.pos.sub(this.dir), this.pos, turn_time).add(1, 1).mul(TILE_SIZE));
            } else {
                this.sprite.position.copy(Vector2.lerp(this.previous.pos, this.pos, turn_time).add(1, 1).mul(TILE_SIZE));
                if (this.wall_crashed()) {
                    // player bumping into a wall
                    this.sprite.position.copy(this.pos.add(this.dir.mul((turn_time - turn_time * turn_time))).add(1, 1).mul(TILE_SIZE));
                }
            }
        } else {
            this.sprite.position.copy(this.pos.add(1, 1).mul(TILE_SIZE));
        }
        Shaku.gfx!.drawSprite(this.sprite);
    }

    wall_crashed(): boolean {
        return (this.previous !== null) && this.previous.age !== this.age && this.age > 0 && this.age - 1 < robot_tape.length && robot_tape[this.age - 1] !== TAPE_SYMBOL.NONE && this.previous.pos.equals(this.pos);
    }

    clone(): GameObject {
        return new Player(this.pos.clone(), this.dir.clone(), this.index, this.age, this);
    }
}

/*let level_editor = new Level("editor", 30, 5, new GameState(
    -1, 0,
    [
        Walls.fromString(`
#...###########.
....#.........#.
....#.........#.
.####.........#.
.#............#.
.#............#.
.#............#.
.#............#.
.##############.
        `),
        new Targets([
            new Vector2(6, 2),
        ]),

        new Button(new Vector2(8, 4), [0], false, null),

        new TwoStateWall(new Vector2(7, 3), Vector2.up, false, null),

        new Spawner(new Vector2(6, 6), Vector2.right, null),
        new Crate(new Vector2(5, 3), null),
        new Crate(new Vector2(10, 2), null),
    ],
));*/

let levels = [
    new Level("first", "sofa", 17, 4, new GameState(
        -1, 0,
        [
            Walls.fromString(`
                .###########
                .#.........#
                #########..#
                #.........##
                #...####..#.
                #####..####.
            `),
            new Targets([
                new Vector2(2, 1),
            ]),

            new Spawner(new Vector2(3, 4), Vector2.left, null),
            new Crate(new Vector2(2, 3), null),
        ],
    )),
    /*new Level("wait_tut", 12, 5, new GameState(
        -1, 0,
        [
            Walls.fromString(`
                ...###....
                ####.#####
                #........#
                ######.#.#
                .....###.#
                .......###
            `),
            new Targets([
                new Vector2(8, 4),
            ]),

            new Button(new Vector2(4, 1), [0], false, null),

            new TwoStateWall(new Vector2(6, 2), Vector2.down, false, null),

            new Spawner(new Vector2(1, 2), Vector2.right, null),
            new Crate(new Vector2(8, 3), null),
        ],
    )),*/
    new Level("basic", "cap", 10, 5, new GameState(
        -1, 0,
        [
            Walls.fromString(`
                #####.
                #...#.
                #...##
                #....#
                ######
            `),
            new Targets([
                new Vector2(1, 3),
            ]),

            new Spawner(new Vector2(1, 1), Vector2.down, null),
            new Crate(new Vector2(3, 2), null),
        ],
    )),
    /*new Level("auto", "sausage", 2, 1, new GameState(
        -1, 0,
        [
            Walls.fromString(`
                #########.......
                #.......########
                ######.........#
                .....##.########
                ......###......
            `),
            new Targets([
                new Vector2(2, 1),
                new Vector2(13, 2),
            ]),

            new Spawner(new Vector2(7, 3), Vector2.up, null),
            new Crate(new Vector2(6, 1), null),
            new Crate(new Vector2(8, 2), null),
        ],
    )),*/
    new Level("move_spawner", "hat", 6, 4, new GameState(
        -1, 0,
        [
            Walls.fromString(`
                .#########.
                .#.......#.
                .#.......#.
                ##.......#.
                #........##
                #.........#
                ###########
            `),
            new Targets([
                new Vector2(2, 1),
                new Vector2(3, 1),
                new Vector2(4, 1),
                new Vector2(5, 1),
                new Vector2(6, 1),
                new Vector2(7, 1),
                new Vector2(8, 1),
            ]),

            new Spawner(new Vector2(2, 5), Vector2.up, null),
            new Crate(new Vector2(2, 2), null),
            new Crate(new Vector2(3, 2), null),
            new Crate(new Vector2(4, 2), null),
            new Crate(new Vector2(5, 2), null),
            new Crate(new Vector2(6, 2), null),
            new Crate(new Vector2(7, 2), null),
            new Crate(new Vector2(8, 2), null),
        ],
    )),
    new Level("microban", "soko", 8, 5, new GameState(
        -1, 0,
        [
            Walls.fromString(`
                ####..
                #..#..
                #..###
                #....#
                #....#
                #..###
                ####..
            `),
            new Targets([
                new Vector2(2, 1),
            ]),

            new Spawner(new Vector2(1, 3), Vector2.right, null),
            new Crate(new Vector2(3, 4), null),
        ],
    )),
    new Level("filler", "whale", 11, 2, new GameState(
        -1, 0,
        [
            Walls.fromString(`
                ###########
                #.#.......#
                #.#.......#
                #.#.......#
                #.#.......#
                #........##
                ##########.
            `),
            new Targets([
                new Vector2(3, 1),
                new Vector2(4, 1),
                new Vector2(5, 1),
                new Vector2(6, 1),
                new Vector2(7, 1),
                new Vector2(8, 1),
            ]),

            new Spawner(new Vector2(1, 1), Vector2.down, null),
            new Crate(new Vector2(3, 4), null),
            new Crate(new Vector2(4, 4), null),
            new Crate(new Vector2(5, 4), null),
            new Crate(new Vector2(6, 4), null),
            new Crate(new Vector2(7, 4), null),
            new Crate(new Vector2(8, 4), null),
        ],
    )),
    new Level("basic_reversed", "house", 15, 10, new GameState(
        -1, 0,
        [
            Walls.fromString(`
                ...###.
                ####.#.
                #....#.
                #.#..##
                #.#...#-
                #######
            `),
            new Targets([
                new Vector2(5, 4),
            ]),

            new Spawner(new Vector2(1, 4), Vector2.up, null),
            new Crate(new Vector2(3, 3), null),
        ],
    )),
    new Level("two_directions", "stairs", 5, 2, new GameState(
        -1, 0,
        [
            Walls.fromString(`
                ..........###
                ..........#.#
                .....######.#
                .....#......#
                ######......#
                #...........#
                #############
            `),
            new Targets([
                new Vector2(11, 2),
                new Vector2(2, 5),
            ]),

            new Spawner(new Vector2(7, 4), Vector2.up, null),
            new Crate(new Vector2(11, 3), null),
            new Crate(new Vector2(3, 5), null),
        ],
    )),
    /*new Level("push_wall_direct", "u-shape", 7, 5, new GameState(
        -1, 0,
        [
            Walls.fromString(`
                ..###....
                ..#.#.###
                ###.#.#.#
                #...###.#
                ###.....#
                ..#######
            `),
            new Targets([
                new Vector2(3, 1),
                new Vector2(7, 2),
            ]),

            new Spawner(new Vector2(1, 3), Vector2.right, null),
            new Crate(new Vector2(3, 2), null),
            new Crate(new Vector2(7, 3), null),
        ],
    )),*/
    new Level("push_wall_mid", "snake", 17, 9, new GameState(
        -1, 0,
        [
            Walls.fromString(`
                #########
                #.......#
                ####.##.#
                ..#.....#
                ..#.##.##
                ..#....#.
                ..######.
            `),
            new Targets([
                new Vector2(5, 3),
            ]),

            new Spawner(new Vector2(1, 1), Vector2.right, null),
            new Crate(new Vector2(4, 2), null),
        ],
    )),
    /*new Level("push_wall_subtle", "camera", 10, 4, new GameState(
        -1, 0,
        [
            Walls.fromString(`
                ######.
                #....##
                #..##.#
                #..##.#
                ##....#
                .######
            `),
            new Targets([
                new Vector2(1, 1),
                new Vector2(5, 2),
            ]),

            new Spawner(new Vector2(4, 1), Vector2.left, null),
            new Crate(new Vector2(2, 2), null),
            new Crate(new Vector2(5, 3), null),
        ],
    )),*/
    /*new Level("bistable_push_down", "lanes", 8, 2, new GameState(
        -1, 0,
        [
            Walls.fromString(`
                ..###.......
                ###.#.......
                #...########
                ###........#
                ..#.########
                ..#.......#.
                ..#########.
            `),
            new Targets([
                new Vector2(9, 3),
                new Vector2(8, 5),
            ]),

            new Spawner(new Vector2(1, 2), Vector2.right, null),
            new Crate(new Vector2(6, 3), null),
            new Crate(new Vector2(4, 5), null),
        ],
    )),*/ // unintended solution: same as trident, on the lower divider
    /*new Level("bistable_push", "prongs", 6, 2, new GameState(
        -1, 0,
        [
            Walls.fromString(`
                ..#########.
                ###.......#.
                #...########
                ###........#
                ..##########
            `),
            new Targets([
                new Vector2(8, 1),
                new Vector2(9, 3),
            ]),

            new Spawner(new Vector2(1, 2), Vector2.right, null),
            new Crate(new Vector2(5, 1), null),
            new Crate(new Vector2(6, 3), null),
        ],
    )),*/
    new Level("bistable_self_loop_push", "train", 6, 3, new GameState(
        -1, 0,
        [
            Walls.fromString(`
                .###.......
                ##.#.......
                #..#######.
                #........##
                #.........#
                ###########
            `),
            new Targets([
                new Vector2(1, 2),
                new Vector2(7, 3),
                new Vector2(8, 4),
            ]),

            new Spawner(new Vector2(2, 1), Vector2.down, null),
            new Crate(new Vector2(1, 3), null),
            new Crate(new Vector2(4, 3), null),
            new Crate(new Vector2(5, 4), null),
        ],
    )),
    new Level("loop_init", "pipe", 15, 12, new GameState(
        -1, 0,
        [
            Walls.fromString(`
                #######......
                #.....#......
                #.##..#......
                #.....#######
                ###.........#
                .##..########
                ..####.......
            `),
            new Targets([
                new Vector2(4, 3),
                new Vector2(10, 4),
            ]),

            new Spawner(new Vector2(3, 5), Vector2.right, null),
            new Crate(new Vector2(3, 3), null),
            new Crate(new Vector2(6, 4), null),
        ],
    )),
    new Level("bistable", "claw", 8, 3, new GameState(
        -1, 0,
        [
            Walls.fromString(`
                ..##########.
                ..#........#.
                ###.########.
                #....#.......
                ####.########
                ...#........#
                ...##########
            `),
            new Targets([
                new Vector2(9, 1),
                new Vector2(10, 5),
            ]),

            new Spawner(new Vector2(1, 3), Vector2.right, null),
            new Crate(new Vector2(5, 1), null),
            new Crate(new Vector2(6, 5), null),
        ],
    )),
    new Level("both_tricks", "toad", 6, 5, new GameState(
        -1, 0,
        [
            Walls.fromString(`
                .##########.
                .#........#.
                #########.#.
                #.........##
                #..........#
                ############
            `),
            new Targets([
                new Vector2(2, 1),
            ]),

            new Spawner(new Vector2(2, 4), Vector2.up, null),
            new Crate(new Vector2(3, 1), null),
        ],
    )),
    new Level("basic_push_diverge", "duck", 10, 3, new GameState(
        -1, 0,
        [
            Walls.fromString(`
                .####.
                .#..#.
                .#..##
                .#...#
                ##.###
                #..#..
                ####..
            `),
            new Targets([
                new Vector2(2, 2),
            ]),

            new Spawner(new Vector2(1, 5), Vector2.right, null),
            new Crate(new Vector2(3, 2), null),
        ],
    )),
    new Level("gaps", "car", 8, 3, new GameState(
        -1, 0,
        [
            Walls.fromString(`
                ...##########.
                ...#........#.
                ...#........#.
                ####........#.
                #...........##
                #............#
                ##############
            `),
            new Targets([
                new Vector2(4, 1),
                new Vector2(5, 1),
                new Vector2(6, 2),
                new Vector2(7, 1),
                new Vector2(8, 1),
                new Vector2(9, 2),
                new Vector2(10, 1),
                new Vector2(11, 1),
            ]),

            new Spawner(new Vector2(2, 5), Vector2.up, null),

            new Crate(new Vector2(4, 2), null),
            new Crate(new Vector2(5, 2), null),
            new Crate(new Vector2(6, 2), null),
            new Crate(new Vector2(7, 2), null),
            new Crate(new Vector2(8, 2), null),
            new Crate(new Vector2(9, 2), null),
            new Crate(new Vector2(10, 2), null),
            new Crate(new Vector2(11, 2), null),
        ],
    )),
    /*new Level("compose", "nose", 20, 11, new GameState(
        -1, 0,
        [
            Walls.fromString(`
                .####.....
                ##..######
                #........#
                ##..##...#
                .#...#####
                .#####....
            `),
            new Targets([
                new Vector2(4, 4),
            ]),

            new Spawner(new Vector2(1, 2), Vector2.right, null),
            new Crate(new Vector2(7, 2), null),
        ],
    )),*/
    /*new Level("twice", "spaceship", 19, 13, new GameState(
        -1, 0,
        [
            Walls.fromString(`
                ..###.....
                ..#.######
                ###......#
                #...##...#
                ##...#####
                .#####....
            `),
            new Targets([
                new Vector2(4, 4),
            ]),

            new Spawner(new Vector2(1, 3), Vector2.right, null),
            new Crate(new Vector2(7, 2), null),
        ],
    )),*/
    /*new Level("push_wait", "forklift", 6, 3, new GameState(
        -1, 0,
        [
            Walls.fromString(`
                ########..
                #......#..
                #......##.
                #.......#.
                #.......##
                #........#
                ##########
            `),
            new Targets([
                new Vector2(1, 1),
                new Vector2(2, 1),
                new Vector2(3, 1),
                new Vector2(4, 1),
                new Vector2(5, 1),
                new Vector2(6, 1),
            ]),

            new Spawner(new Vector2(2, 5), Vector2.up, null),
            new Crate(new Vector2(1, 2), null),
            new Crate(new Vector2(2, 2), null),
            new Crate(new Vector2(3, 2), null),
            new Crate(new Vector2(4, 2), null),
            new Crate(new Vector2(5, 2), null),
            new Crate(new Vector2(6, 2), null),
        ],
    )),*/
    new Level("double_move_spawner", "factory", 13, 4, new GameState(
        -1, 0,
        [
            Walls.fromString(`
                ..###########..
                ###.#.#.#.#.#..
                #...........##.
                #............#.
                #............#.
                #............##
                #.............#
                ###############
            `),
            new Targets([
                new Vector2(2, 3),
                new Vector2(4, 3),
                new Vector2(6, 3),
                new Vector2(8, 3),
                new Vector2(10, 3),
            ]),

            new Spawner(new Vector2(2, 6), Vector2.up, null),

            new Crate(new Vector2(2, 2), null),
            new Crate(new Vector2(4, 2), null),
            new Crate(new Vector2(6, 2), null),
            new Crate(new Vector2(8, 2), null),
            new Crate(new Vector2(10, 2), null),
        ],
    )),
    /*new Level("loop_init", "pipe", 11, 8, new GameState(
        -1, 0,
        [
            Walls.fromString(`
                ######......
                #....#......
                #....#######
                ##.........#
                .#..########
                .#.##.......
                .###........
            `),
            new Targets([
                new Vector2(3, 2),
                new Vector2(9, 3),
            ]),

            new Spawner(new Vector2(2, 4), Vector2.right, null),
            new Crate(new Vector2(2, 2), null),
            new Crate(new Vector2(5, 3), null),
        ],
    )),*/
    new Level("companion_cube", "fish", 14, 12, new GameState(
        -1, 0,
        [
            Walls.fromString(`
                ...#########.
                ..##.......#.
                .##........#.
                .#.........#.
                ##.........##
                #...........#
                #...........#
                #############
            `),
            new Targets([
                new Vector2(10, 3),
                new Vector2(4, 1),
                new Vector2(5, 1),
                new Vector2(6, 1),
                new Vector2(7, 1),
                new Vector2(8, 1),
                new Vector2(9, 1),
                new Vector2(10, 1),
            ]),

            new Spawner(new Vector2(2, 6), Vector2.up, null),
            new Crate(new Vector2(3, 3), null),
            new Crate(new Vector2(4, 2), null),
            new Crate(new Vector2(5, 2), null),
            new Crate(new Vector2(6, 2), null),
            new Crate(new Vector2(7, 2), null),
            new Crate(new Vector2(8, 2), null),
            new Crate(new Vector2(9, 2), null),
            new Crate(new Vector2(10, 2), null),
        ],
    )),
    new Level("u_chain", "chip", 16, 2, new GameState(
        -1, 0,
        [
            Walls.fromString(`
                ###########
                #.........#
                #.........#
                #.........#
                #.........#
                #.......###
                #########..
            `),
            new Targets([
                new Vector2(3, 2),
                new Vector2(4, 2),
                new Vector2(5, 2),
                new Vector2(6, 2),
                new Vector2(7, 2),
                new Vector2(8, 2),
            ]),

            new Spawner(new Vector2(1, 1), Vector2.down, null),
            new Crate(new Vector2(3, 4), null),
            new Crate(new Vector2(4, 4), null),
            new Crate(new Vector2(5, 4), null),
            new Crate(new Vector2(6, 4), null),
            new Crate(new Vector2(7, 4), null),
            new Crate(new Vector2(8, 4), null),
        ],
    )),
    /*new Level("twice_reversed", 19, 7, new GameState(
        -1, 0,
        [
            Walls.fromString(`
                ..###..
                ###.###
                #.....#
                #.#...#
                #....##
                ######.
            `),
            new Targets([
                new Vector2(4, 4),
            ]),

            new Spawner(new Vector2(1, 4), Vector2.up, null),
            new Crate(new Vector2(4, 2), null),
        ],
    )),*/
    /*new Level("left_right_both_up", "factory", 12, 4, new GameState(
        -1, 0,
        [
            Walls.fromString(`
                ##########...
                #........###.
                #........#.#.
                #........#.#.
                #..........#.
                #..........#.
                #..........##
                #...........#
                #############
            `),
            new Targets([
                new Vector2(1, 2),
                new Vector2(2, 2),
                new Vector2(3, 2),
                new Vector2(4, 2),
                new Vector2(5, 2),
                new Vector2(6, 2),
                new Vector2(7, 2),
                new Vector2(8, 2),
                new Vector2(10, 3),
            ]),

            new Spawner(new Vector2(3, 7), Vector2.up, null),

            new Crate(new Vector2(1, 3), null),
            new Crate(new Vector2(2, 3), null),
            new Crate(new Vector2(3, 3), null),
            new Crate(new Vector2(4, 3), null),
            new Crate(new Vector2(5, 3), null),
            new Crate(new Vector2(6, 3), null),
            new Crate(new Vector2(7, 3), null),
            new Crate(new Vector2(8, 3), null),
            new Crate(new Vector2(10, 4), null),
        ],
    )),*/ // very broken    
    new Level("mini_avoid_avoiding", "worm", 7, 3, new GameState(
        -1, 0,
        [
            Walls.fromString(`
                .....#########..
                .....#.......#..
                .....#.#########
                .....#.........#
                ########...#####
                #.........##....
                ###########.....
            `),
            new Targets([
                new Vector2(11, 1),
                new Vector2(13, 3),
                new Vector2(2, 5),
            ]),

            new Spawner(new Vector2(10, 4), Vector2.left, null),
            new Crate(new Vector2(8, 1), null),
            new Crate(new Vector2(10, 3), null),
            new Crate(new Vector2(6, 5), null),
        ],
    )),
    /*new Level("avoid_avoiding", "cannon", 17, 8, new GameState(
        -1, 0,
        [
            Walls.fromString(`
                ...###.........
                ..##.#########.
                ..#..........##
                .##...........#
                ##...........##
                #.....########.
                #.....#........
                #...#.#........
                #######........
            `),
            new Targets([
                new Vector2(11, 2),
                new Vector2(12, 3),
                new Vector2(11, 4),
            ]),

            new Spawner(new Vector2(4, 1), Vector2.down, null),
            new Crate(new Vector2(7, 2), null),
            new Crate(new Vector2(8, 3), null),
            new Crate(new Vector2(7, 4), null),
        ],
    )),*/
    /*new Level("tree", "trident", 14, 4, new GameState(
        -1, 0,
        [
            Walls.fromString(`
                ..##########...
                .##........#...
                ##..########...
                #..........#...
                ###..##########
                ..##..........#
                ...############
            `),
            new Targets([
                new Vector2(9, 1),
                new Vector2(9, 3),
                new Vector2(12, 5),
            ]),

            new Spawner(new Vector2(1, 3), Vector2.right, null),
            new Crate(new Vector2(6, 1), null),
            new Crate(new Vector2(6, 3), null),
            new Crate(new Vector2(6, 5), null),
        ],
    )),*/
]

let level_icon_sprites = new Map<string, Sprite>();
{
    let atlas_size = new Vector2(6, 3);
    let k = 0;
    for (let level_name of ["sofa", "cap", "hat", "soko", "whale", "house", "stairs", "snake", "train", "pipe", "claw", "toad", "duck", "car", "factory", "fish", "chip", "worm"]) {
        let cur_spr = new Sprite(icons_texture);
        cur_spr.setSourceFromSpritesheet(new Vector2(k % atlas_size.x, Math.floor(k / atlas_size.x)), atlas_size)
        cur_spr.position.set(
            (k % menu_row_size) * menu_button_spacing + menu_off_x + menu_button_size / 2,
            Math.floor(k / menu_row_size) * menu_button_spacing + menu_off_y + menu_button_size / 2,
        )
        level_icon_sprites.set(level_name, cur_spr);
        k++;
    }
}

enum STATE {
    INTRO,
    GAME,
    MENU,
}

let in_end_screen = false;

let state = STATE.INTRO;

enum TAPE_SYMBOL {
    LEFT,
    RIGHT,
    UP,
    DOWN,
    NONE,
}

let waiting_for_final_input = false;
let exiting_level = false;
let EDITOR = false;

let robot_delay = 5;

// instructions for the robot(s)
let robot_tape: TAPE_SYMBOL[] = [];

// let selected_tape_pos = 0;
let selected_turn = 0;

let cur_turn = 0;
let time_offset = 0;
let ending_boost = 0;

let initial_state: GameState;

let all_states: GameState[]; // = gameLogic(initial_state, robot_tape);

let particles: Particle[] = [];

let level_offset = Vector2.zero;

let row_1 = 0;
let row_2 = 0;

let row_1_background = new Sprite(Shaku.gfx.whiteTexture);
row_1_background.origin = Vector2.zero;
row_1_background.color = COLOR_TAPE;

let row_2_background = new Sprite(Shaku.gfx.whiteTexture);
row_2_background.origin = Vector2.zero;
row_2_background.color = COLOR_TAPE;

let exit_transition_cancelled = false;

let cur_level_n = 0;
let cur_level: Level;
load_level(levels[cur_level_n]);

let n_flashing = 0;

function load_level(level: Level) {
    cur_level = level;
    selected_turn = 0;
    cur_turn = 0;
    time_offset = -.99;
    ending_boost = 2;
    n_flashing = 0;
    robot_delay = level.n_delay;
    updateTapeLength(level.n_moves)
    initial_state = level.initial_state.nextStates().at(-1)!;
    all_states = gameLogic(initial_state, robot_tape);
    level_offset = new Vector2(initial_state.wall.w, initial_state.wall.h).mul(TILE_SIZE).sub(game_size).add(TILE_SIZE, TILE_SIZE).mul(.5);
    if (level.dev_name === "first") {
        level_offset.y += TILE_SIZE * .5;
    }
    waiting_for_final_input = false;
    exiting_level = false;
    EDITOR = false;
    for (let key in _cooling_time_left) {
        _cooling_time_left[key] = Infinity;
    }
    in_end_screen = false;
    particles = [];
}

function openCurInEditor() {
    let old_wall = initial_state.wall;
    let off_x = Math.floor((16 - old_wall.w) / 2);
    let off_y = Math.floor((9 - old_wall.h) / 2);
    let new_wall = new Walls(16, 9);
    for (let i = 0; i < old_wall.w; i++) {
        for (let j = 0; j < old_wall.h; j++) {
            new_wall.data[off_y + j][off_x + i] = old_wall.data[j][i];
        }
    }
    initial_state.things = initial_state.things.map(x => {
        if (x instanceof Walls) return new_wall;
        if (x instanceof Pushable || x instanceof TwoStateWall || x instanceof Button) {
            x.pos.addSelf(off_x, off_y);
            return x;
        }
        if (x instanceof Targets) {
            x.positions.forEach(p => {
                p.addSelf(off_x, off_y)
            });
            return x;
        }
        return x;
    });
    initial_state.wall.recalcFloors(initial_state.spawner.pos);

    selected_turn = 0;
    cur_turn = 0;
    time_offset = 0;
    ending_boost = 2;
    all_states = gameLogic(initial_state, robot_tape);
    level_offset = new Vector2(16, 9).mul(TILE_SIZE).sub(game_size).add(TILE_SIZE, TILE_SIZE).mul(.5);
}

function updateTapeLength(n: number, keep_tape: boolean = false) {
    if (keep_tape) {
        while (robot_tape.length > n) {
            robot_tape.pop();
        }
        while (robot_tape.length < n) {
            robot_tape.push(TAPE_SYMBOL.NONE);
        }
    } else {
        robot_tape = Array(n).fill(TAPE_SYMBOL.NONE);
    }
    if (n < 13) {
        row_1 = n;
        row_2 = 0;
    } else {
        row_1 = Math.ceil(n / 2);
        row_2 = n - row_1;
    }
    row_1_background.position.set(-SYMBOL_SIZE * .5 + 8, 8)
    row_1_background.size.set(SYMBOL_SIZE * (row_1 + 1) - 16, SYMBOL_SIZE * 1.5 - 16);

    if (row_2 > 0) {
        row_2_background.position.set(-SYMBOL_SIZE * .5 + 8, 8)
        row_2_background.size.set(SYMBOL_SIZE * (row_2 + 1) - 16, SYMBOL_SIZE * 1.5 - 16);
    }
}

function gameLogic(initial_state: GameState, robot_tape: TAPE_SYMBOL[]): GameState[] {
    let res_all_states: GameState[] = [initial_state];
    let cur_state = initial_state;
    for (let k = 0; k <= selected_turn; k++) {
        while (true) {
            let new_states = cur_state.nextStates();
            res_all_states = res_all_states.concat(new_states);
            cur_state = new_states.at(-1)!;
            if (cur_state.major_turn !== k) break;
        }
    }
    if (cur_turn + 1 > res_all_states.length) {
        cur_turn = 0;
    }
    return res_all_states;
}

function drawSymbol(symbol: TAPE_SYMBOL, pos: Vector2) {
    switch (symbol) {
        case TAPE_SYMBOL.LEFT:
            left_arrow.rotation = 0;
            left_arrow.position.copy(pos);
            Shaku.gfx?.drawSprite(left_arrow);
            break;
        case TAPE_SYMBOL.UP:
            left_arrow.rotation = Math.PI * 0.5;
            left_arrow.position.copy(pos);
            Shaku.gfx?.drawSprite(left_arrow);
            break;
        case TAPE_SYMBOL.RIGHT:
            left_arrow.rotation = Math.PI;
            left_arrow.position.copy(pos);
            Shaku.gfx?.drawSprite(left_arrow);
            break;
        case TAPE_SYMBOL.DOWN:
            left_arrow.rotation = Math.PI * 1.5;
            left_arrow.position.copy(pos);
            Shaku.gfx?.drawSprite(left_arrow);
            break;
        case TAPE_SYMBOL.NONE:
            none_sprite.position.copy(pos);
            Shaku.gfx?.drawSprite(none_sprite);
            break;
        default:
            break;
    }
}

const MAIN_SCREEN_SPRITE = new Sprite(Shaku.gfx.whiteTexture);
MAIN_SCREEN_SPRITE.origin = Vector2.zero;
MAIN_SCREEN_SPRITE.size = game_size;
const background_effect = Shaku.gfx.createEffect(BackgroundEffect);
Shaku.gfx.useEffect(background_effect);
// @ts-ignore
background_effect.uniforms["u_aspect_ratio"](MAIN_SCREEN_SPRITE.size.x / MAIN_SCREEN_SPRITE.size.y);

const bar_effect = Shaku.gfx.createEffect(BarEffect);
Shaku.gfx.useEffect(bar_effect);
// @ts-ignore
bar_effect.uniforms["u_aspect_ratio"](LOWER_SCREEN_SPRITE.size.x / LOWER_SCREEN_SPRITE.size.y);

const FULL_SCREEN_SPRITE = new Sprite(Shaku.gfx.whiteTexture);
FULL_SCREEN_SPRITE.origin = Vector2.zero;
FULL_SCREEN_SPRITE.size = Shaku.gfx.getCanvasSize();
const transition_effect = Shaku.gfx.createEffect(TransitionEffect);
Shaku.gfx.useEffect(transition_effect);
// @ts-ignore
transition_effect.uniforms["u_screen_size"](FULL_SCREEN_SPRITE.size.x, FULL_SCREEN_SPRITE.size.y);

// @ts-ignore
Shaku.gfx.useEffect(null);

let changing_rects: [Sprite, number, boolean][] = [];
function setSymbolChanging(n: number) {
    const rect_spr = new Sprite(Shaku.gfx.whiteTexture);
    rect_spr.origin = new Vector2(0, -8 / (SYMBOL_SIZE * 1.5));
    rect_spr.size.set(SYMBOL_SIZE, SYMBOL_SIZE * 1.5 - 16);
    if (n < row_1) {
        rect_spr.position.set(n * SYMBOL_SIZE, 0);
    } else {
        rect_spr.position.set((n - row_1) * SYMBOL_SIZE, 0);
    }
    rect_spr.color = COLOR_SYMBOL;

    changing_rects.push([rect_spr, .15, n < row_1]);
}

function drawSymbolsChanging(dt: number, lower_row: boolean) {
    for (var i = changing_rects.length - 1; i >= 0; i--) {
        let [r, t, b] = changing_rects[i];
        if (b === lower_row) continue;
        Shaku.gfx.drawSprite(r);
        t -= dt;
        if (t <= 0) {
            changing_rects.splice(i, 1);
        } else {
            changing_rects[i][1] = t;
        }
    }
}

let menu_selected_level = 0;

let drawExtra = function () {
    let intro_text_left_1 = Shaku.gfx.buildText(instructions_font, "WASD to\nmove", 32, Color.white, TextAlignments.Center);
    intro_text_left_1.position.set(110, 90);
    let intro_text_right_1 = Shaku.gfx.buildText(instructions_font, "Arrow keys\nto move", 32, Color.white, TextAlignments.Center);
    intro_text_right_1.position.set(690, 90);

    // let intro_text_left_2 = Shaku.gfx.buildText(instructions_font, "Space to\nwait", 32, Color.white, TextAlignments.Center);
    // intro_text_left_2.position.set(110, 190);
    // let intro_text_right_2 = Shaku.gfx.buildText(instructions_font, "Space to\nwait", 32, Color.white, TextAlignments.Center);
    // intro_text_right_2.position.set(690, 190);

    let intro_text_left_3 = Shaku.gfx.buildText(instructions_font, "Q/E to\nchange turn", 32, Color.white, TextAlignments.Center);
    intro_text_left_3.position.set(110, 290);
    let intro_text_right_3 = Shaku.gfx.buildText(instructions_font, "Z/X to\nchange turn", 32, Color.white, TextAlignments.Center);
    intro_text_right_3.position.set(690, 290);

    let intro_text_2 = Shaku.gfx.buildText(instructions_font, "Space to wait", 32, Color.white, TextAlignments.Center);
    intro_text_2.position.set(400, 410);

    let intro_text_4 = Shaku.gfx.buildText(instructions_font, "R to restart, Esc. to select level", 28, Color.white, TextAlignments.Center);
    intro_text_4.position.set(400, 550);

    // let use_space_text = Shaku.gfx.buildText(instructions_font, "Space to wait", 32, Color.white, TextAlignments.Center);
    // use_space_text.position.set(550, 90);

    let permanent_text_left = Shaku.gfx.buildText(instructions_font, "Q/Z", 32, Color.lightgrey, TextAlignments.Center);
    permanent_text_left.position.set(30, 420);
    let permanent_text_right = Shaku.gfx.buildText(instructions_font, "E/X", 32, Color.lightgrey, TextAlignments.Center);
    permanent_text_right.position.set(770, 420);

    return function () {
        if (in_end_screen) return;
        /*if (CONFIG.time === "MANUAL" && selected_turn >= robot_tape.length) {
            Shaku.gfx.useEffect(Shaku.gfx.builtinEffects.MsdfFont);
            Shaku.gfx.drawGroup(permanent_text_left, false);
            Shaku.gfx.drawGroup(permanent_text_right, false);
            // @ts-ignore
            Shaku.gfx.useEffect(null);
        }*/
        if (EDITOR) return;
        if (cur_level_n === 0) {
            // Shaku.gfx.useEffect(Shaku.gfx.builtinEffects.MsdfFont);
            // Shaku.gfx.drawGroup(intro_text_left_1, false);
            // Shaku.gfx.drawGroup(intro_text_right_1, false);
            // // Shaku.gfx.drawGroup(intro_text_left_2, false);
            // // Shaku.gfx.drawGroup(intro_text_right_2, false);
            // // if (CONFIG.time === "MANUAL") {
            // Shaku.gfx.drawGroup(intro_text_left_3, false);
            // Shaku.gfx.drawGroup(intro_text_right_3, false);
            // // }
            // Shaku.gfx.drawGroup(intro_text_2, false);
            // Shaku.gfx.drawGroup(intro_text_4, false);
            // // @ts-ignore
            // Shaku.gfx.useEffect(null);

            dirs_sprite.sourceRect.y = (Shaku.gameTime.elapsed % 2) < 1 ? 0 : 100;
            undo_sprite.sourceRect.y = (Shaku.gameTime.elapsed % 2) < 1 ? 0 : 50;
            dirs_sprite.position.set(400, 360);
            space_sprite.position.set(150, 385);
            undo_sprite.position.set(650, 385);

            Shaku.gfx.drawSprite(dirs_sprite);
            Shaku.gfx.drawSprite(space_sprite);
            Shaku.gfx.drawSprite(undo_sprite);

        } /*else if (cur_level_n === 1) {
            Shaku.gfx.useEffect(Shaku.gfx.builtinEffects.MsdfFont);
            Shaku.gfx.drawGroup(use_space_text, false);
            // @ts-ignore
            Shaku.gfx.useEffect(null);
        }*/
    }
}();

/** From 0 to 1 */
let intro_exit_time = 0;
let editor_button_looking_for_target = -1;
// do a single main loop step and request the next step
function update() {
    // start a new frame and clear screen
    Shaku.startFrame();
    Shaku.gfx!.clear(Shaku.utils.Color.darkslategray);

    if (Shaku.input.pressed("m")) {
        muted = !muted;
        mute_sprite.sourceRect.y = muted ? 0 : 50;
        mute_sprite.size.mulSelf(1.25);
        mute_sprite.rotation = (Math.random() - .5) * .2;
        new Animator(mute_sprite).to({ "size.x": 100, "size.y": 50, "rotation": 0 }).duration(.1).play();
    }

    if (Shaku.input.pressed("b")) {
        background_paused = !background_paused;
    }

    Shaku.gfx.useEffect(background_effect);
    if (!background_paused) {
        // @ts-ignore
        background_effect.uniforms["u_time"](Shaku.gameTime.elapsed);
    }
    // @ts-ignore
    background_effect.uniforms["u_alpha"](1);
    Shaku.gfx.drawSprite(MAIN_SCREEN_SPRITE);
    // @ts-ignore
    Shaku.gfx.useEffect(null);

    if (state === STATE.INTRO) {
        // @ts-ignore
        LOWER_SCREEN_SPRITE.color.a = 1;
    }
    Shaku.gfx.useEffect(bar_effect);
    // @ts-ignore
    bar_effect.uniforms["u_time"](Shaku.gameTime.elapsed);
    // @ts-ignore
    bar_effect.uniforms["u_alpha"](1);
    // @ts-ignore
    bar_effect.uniforms["u_dark"](1);
    Shaku.gfx.drawSprite(LOWER_SCREEN_SPRITE);
    // @ts-ignore
    Shaku.gfx.useEffect(null);

    if (selected_turn >= robot_tape.length) {
        FULL_SCREEN_SPRITE.color = new Color(0, 0, 0, .4);
        Shaku.gfx.drawSprite(FULL_SCREEN_SPRITE);
    }

    // changing game state
    switch (state) {
        case STATE.GAME:
            if (time_offset === 0 && !exiting_level && Shaku.input.pressed(["escape", "p"])) {
                menu_selected_level = cur_level_n;
                state = STATE.MENU;
            }
            break;

        case STATE.MENU:
            if (Shaku.input.pressed(["escape", "p"])) {
                state = STATE.GAME;
            } else if (Shaku.input.pressed(["enter", "space"]) || Shaku.input.mousePressed()) {
                initTransitionToLevel(menu_selected_level);
            }
            break;

        default:
            break;
    }

    if (state === STATE.GAME && !in_end_screen) {
        if (pressed_throttled(["q", "z"], Shaku.gameTime.delta) && selected_turn > 0) {
            if (waiting_for_final_input || exiting_level) {
                cancelExitTransition();
            }
            selected_turn -= 1;
        } else if (pressed_throttled(["e", "x"], Shaku.gameTime.delta)) {
            if (waiting_for_final_input || exiting_level) {
                waiting_for_final_input = false;
            } else {
                selected_turn += 1;
                if (selected_turn >= all_states.at(-1)!.major_turn) {
                    all_states = gameLogic(initial_state, robot_tape);
                }
            }
        }

        if (!exiting_level && Shaku.input?.pressed(["r"])) {
            selected_turn = 0;
            if (CONFIG.instant_reset) {
                cur_turn = 0;
                time_offset = -.99;
                robot_tape = robot_tape.fill(TAPE_SYMBOL.NONE);
                all_states = gameLogic(initial_state, robot_tape);
            }
        }

        if (time_offset === 0 && CONFIG.time === "AUTO" && all_states[cur_turn].major_turn >= robot_tape.length && all_states[cur_turn].minor_turn == 0 && all_states[cur_turn].someChanges && !all_states[cur_turn].won) {
            selected_turn += 1;
            if (selected_turn >= all_states.at(-1)!.major_turn) {
                all_states = gameLogic(initial_state, robot_tape);
            }
        }

        if (Shaku.input?.pressed(["t"])) {
            console.log("cur_turn: ", cur_turn);
            console.log("selected_turn: ", selected_turn);
            console.log("cur_state: ", all_states[cur_turn]);
            console.log("all states: ", all_states);
        }

        // console.log("cur_turn: ", cur_turn, "selected_turn: ", selected_turn, "offset: ", time_offset);

        let input_symbol = selectFromInput([
            [["w", "up"], TAPE_SYMBOL.UP],
            [["s", "down"], TAPE_SYMBOL.DOWN],
            [["d", "right"], TAPE_SYMBOL.RIGHT],
            [["a", "left"], TAPE_SYMBOL.LEFT],
            ["space", TAPE_SYMBOL.NONE],
        ], Shaku.gameTime.delta)
        // if (input_symbol !== null && time_offset === 0) {
        if (input_symbol !== null) {
            if (waiting_for_final_input || exiting_level) {
                waiting_for_final_input = false;
            } else if (selected_turn < robot_tape.length) {
                robot_tape[selected_turn] = input_symbol;
                setSymbolChanging(selected_turn);
                selected_turn += 1;
                all_states = gameLogic(initial_state, robot_tape);
            } else {
                if (input_symbol === TAPE_SYMBOL.NONE) {
                    selected_turn += 1;
                    if (selected_turn >= all_states.at(-1)!.major_turn) {
                        all_states = gameLogic(initial_state, robot_tape);
                    }
                } else {
                    if (CONFIG.time === "MANUAL") {
                        n_flashing += 1;
                        let time_left = .1;
                        let first = cur_level.dev_name === "first";
                        if (first) {
                            space_sprite.color = COLOR_BRIGHT;
                            space_sprite.size.mulSelf(1.15);
                            space_sprite.rotation = (Math.random() - .5) * .2;
                            new Animator(space_sprite).to({ "size.x": 200, "size.y": 50, "rotation": 0 }).duration(.1).play();
                        } else {
                            row_1_background.color = COLOR_SYMBOL;
                            row_2_background.color = COLOR_SYMBOL;
                        }
                        doEveryFrameUntilTrue(() => {
                            if (!first) {
                                Shaku.gfx.setCameraOrthographic(new Vector2(-400 + .5 * row_1 * SYMBOL_SIZE, -445));
                                Shaku.gfx.drawSprite(row_1_background);
                                if (row_2 > 0) {
                                    Shaku.gfx.setCameraOrthographic(new Vector2(-400 + .5 * row_2 * SYMBOL_SIZE, -445 - 75));
                                    Shaku.gfx.drawSprite(row_2_background);
                                }
                                Shaku.gfx.resetCamera();
                            }
                            time_left -= Shaku.gameTime.delta;
                            if (time_left < 0) {
                                n_flashing -= 1;
                                if (n_flashing === 0) {
                                    row_1_background.color = COLOR_TAPE;
                                    row_2_background.color = COLOR_TAPE;
                                    space_sprite.color = Color.white;
                                }
                                return true;
                            }
                            return false;
                        })
                    } else if (CONFIG.time === "SEMI") {
                        selected_turn += 1;
                        if (selected_turn >= all_states.at(-1)!.major_turn) {
                            all_states = gameLogic(initial_state, robot_tape);
                        }
                    }
                }
            }
        }
    }

    Shaku.gfx.setCameraOrthographic(level_offset);

    if (time_offset < 0) { // going forwards in time
        all_states[cur_turn].draw(clamp((time_offset + 1) / (1 - margin_fraction), 0, 1));
    } else if (time_offset > 0) { // going backwards in time
        all_states[cur_turn + 1].draw(clamp((time_offset - margin_fraction) / (1 - margin_fraction), 0, 1));
    } else {
        all_states[cur_turn].draw(1);
    }
    particles.forEach(p => p.draw());

    // editor
    if (state === STATE.GAME && EDITOR && !in_end_screen) {
        let mouse_tile = Shaku.input!.mousePosition.add(level_offset).div(TILE_SIZE).round().sub(1, 1);
        Shaku.gfx!.outlineRect(
            new Rectangle(
                (mouse_tile.x + .5) * TILE_SIZE,
                (mouse_tile.y + .5) * TILE_SIZE,
                TILE_SIZE,
                TILE_SIZE
            ),
            Shaku.utils.Color.white
        )
        if (Shaku.input?.mouseDown(MouseButtons.left)) {
            initial_state.wall.setAt(mouse_tile, true);
            initial_state.wall.recalcFloors(initial_state.spawner.pos);
            all_states = gameLogic(initial_state, robot_tape);
        }
        if (Shaku.input?.mouseDown(MouseButtons.right)) {
            initial_state.wall.setAt(mouse_tile, false);
            initial_state.wall.recalcFloors(initial_state.spawner.pos);
            all_states = gameLogic(initial_state, robot_tape);
        }
        if (Shaku.input?.mouseWheelSign !== 0) {
            if (Shaku.input.shiftDown) {
                let n = clamp(robot_tape.length + Shaku.input?.mouseWheelSign, 2, 30);
                updateTapeLength(n, true);
            } else {
                robot_delay += Shaku.input?.mouseWheelSign;
                robot_delay = Math.max(1, robot_delay);
            }
            all_states = gameLogic(initial_state, robot_tape);
        }
        if (Shaku.input!.keyPressed(KeyboardKeys.n1)) {
            let crate_index = indexOfTrue(initial_state.things, c => (c instanceof Crate && c.pos.equals(mouse_tile)));
            if (crate_index === -1) {
                initial_state.things.push(new Crate(mouse_tile, null));
            } else {
                initial_state.things.splice(crate_index, 1)
            }
            all_states = gameLogic(initial_state, robot_tape);
        }
        if (Shaku.input!.keyPressed(KeyboardKeys.n2)) {
            initial_state.target.toggleAt(mouse_tile);
        }
        if (Shaku.input!.keyPressed(KeyboardKeys.n3)) {
            initial_state.spawner.pos = mouse_tile;
            initial_state.spawner.dir = mainDir(Shaku.input!.mousePosition.add(level_offset).div(TILE_SIZE).sub(1, 1).sub(mouse_tile));
            initial_state.spawner.sprite.rotation = initial_state.spawner.dir.getRadians(); // hacky
            initial_state.players[0].pos = initial_state.spawner.pos.add(initial_state.spawner.dir); // hacky
            initial_state.players[0].dir = initial_state.spawner.dir.clone(); // hacky
            all_states = gameLogic(initial_state, robot_tape);
        }
        if (Shaku.input!.keyPressed(KeyboardKeys.n4)) {
            let two_state_wall_index = indexOfTrue(initial_state.things, x => (x instanceof TwoStateWall && x.pos.equals(mouse_tile)));
            if (two_state_wall_index === -1) {
                initial_state.things.push(new TwoStateWall(
                    mouse_tile, mainDir(Shaku.input!.mousePosition.add(level_offset).div(TILE_SIZE).sub(1, 1).sub(mouse_tile)), false, null));
            } else {
                console.log(two_state_wall_index);
                (initial_state.things[two_state_wall_index] as ButtonTarget).remove(initial_state);
                console.log(initial_state);
            }
            all_states = gameLogic(initial_state, robot_tape);
        }
        if (Shaku.input!.keyPressed(KeyboardKeys.n5)) {
            let button_index = indexOfTrue(initial_state.things, b => (b instanceof Button && b.pos.equals(mouse_tile)));
            if (button_index === -1) {
                initial_state.things.push(new Button(mouse_tile, [], false, null));
            } else {
                initial_state.things.splice(button_index, 1)
            }
            all_states = gameLogic(initial_state, robot_tape);
        }
        if (Shaku.input!.keyPressed(KeyboardKeys.n6)) {
            if (editor_button_looking_for_target === -1) {
                editor_button_looking_for_target = indexOfTrue(initial_state.things, b => (b instanceof Button && b.pos.equals(mouse_tile)));
            } else {
                // editor_looking_for_button_target
                let button_target_index = initial_state.buttonTargets.findIndex(x => x instanceof TwoStateWall && x.pos.equals(mouse_tile));
                if (button_target_index !== -1) {
                    let button = initial_state.things[editor_button_looking_for_target] as Button;
                    if (button.target_ids.includes(button_target_index)) {
                        button.target_ids = button.target_ids.filter(x => x != button_target_index);
                    } else {
                        button.target_ids.push(button_target_index);
                    }
                }
                editor_button_looking_for_target = -1;
            }
            all_states = gameLogic(initial_state, robot_tape);
        }
        if (editor_button_looking_for_target !== -1) {
            let button = initial_state.things[editor_button_looking_for_target] as Button;
            Shaku.gfx!.fillRect(
                new Rectangle(
                    (button.pos.x + .5) * TILE_SIZE,
                    (button.pos.y + .5) * TILE_SIZE,
                    TILE_SIZE,
                    TILE_SIZE
                ),
                button.active ? Shaku.utils.Color.red : Shaku.utils.Color.green,
            )
        }
    }

    Shaku.gfx.setCameraOrthographic(new Vector2(-400 + .5 * row_1 * SYMBOL_SIZE, -445));
    Shaku.gfx.drawSprite(row_1_background);
    if (robot_delay < row_1) {
        Shaku.gfx.fillRect(new Rectangle(robot_delay * SYMBOL_SIZE, 8, SYMBOL_SIZE, SYMBOL_SIZE * 1.5 - 16), COLOR_TAPE_DELAY);
    }
    for (let k = selected_turn; k >= 0; k -= robot_delay) {
        if (k >= row_1) continue;
        if (k === selected_turn) {
            if (changing_rects.length === 0) {
                tape_high.position.set(k * SYMBOL_SIZE, 0);
                Shaku.gfx.drawSprite(tape_high);
            }
        } else {
            tape_low.position.set(k * SYMBOL_SIZE, 0);
            Shaku.gfx.drawSprite(tape_low);
        }
    }
    drawSymbolsChanging(Shaku.gameTime.delta, false);
    Shaku.gfx.drawSprite(tape_border_left);
    tape_border_right.position.set(row_1 * SYMBOL_SIZE, 0);
    Shaku.gfx.drawSprite(tape_border_right);
    for (let k = 0; k < row_1; k++) {
        tape_border.position.set(k * SYMBOL_SIZE, 0);
        Shaku.gfx.drawSprite(tape_border);
        let cur_symbol = robot_tape[k];
        drawSymbol(cur_symbol, new Vector2((k + .5) * SYMBOL_SIZE, SYMBOL_SIZE * .75));
    }
    if (row_2 > 0) {
        Shaku.gfx.setCameraOrthographic(new Vector2(-400 + .5 * row_2 * SYMBOL_SIZE, -445 - 75));
        Shaku.gfx?.fillRect(
            new Rectangle(-SYMBOL_SIZE * .5 + 8, 8, SYMBOL_SIZE * (row_2 + 1) - 16, SYMBOL_SIZE * 1.5 - 16),
            COLOR_TAPE
        )
        if (robot_delay >= row_1) {
            Shaku.gfx.fillRect(new Rectangle((robot_delay - row_1) * SYMBOL_SIZE, 8, SYMBOL_SIZE, SYMBOL_SIZE * 1.5 - 16), COLOR_TAPE_DELAY);
        }
        for (let k = selected_turn; k >= row_1; k -= robot_delay) {
            if (k >= row_1 + row_2) continue;
            if (k === selected_turn) {
                if (changing_rects.length === 0) {
                    tape_high.position.set((k - row_1) * SYMBOL_SIZE, 0);
                    Shaku.gfx.drawSprite(tape_high);
                }
            } else {
                tape_low.position.set((k - row_1) * SYMBOL_SIZE, 0);
                Shaku.gfx.drawSprite(tape_low);
            }
        }
        drawSymbolsChanging(Shaku.gameTime.delta, true);
        Shaku.gfx.drawSprite(tape_border_left);
        tape_border_right.position.set(row_2 * SYMBOL_SIZE, 0);
        Shaku.gfx.drawSprite(tape_border_right);
        for (let k = 0; k < row_2; k++) {
            tape_border.position.set(k * SYMBOL_SIZE, 0);
            Shaku.gfx.drawSprite(tape_border);
            let cur_symbol = robot_tape[k + row_1];
            drawSymbol(cur_symbol, new Vector2((k + .5) * SYMBOL_SIZE, SYMBOL_SIZE * .75));
        }
    }

    Shaku.gfx.resetCamera()

    if (in_end_screen) {
        Shaku.gfx.useEffect(background_effect);
        // @ts-ignore
        background_effect.uniforms["u_aspect_ratio"](FULL_SCREEN_SPRITE.size.x / FULL_SCREEN_SPRITE.size.y);
        Shaku.gfx.drawSprite(FULL_SCREEN_SPRITE);
        // @ts-ignore
        Shaku.gfx.useEffect(null);

        // Shaku.gfx.drawSprite(LOWER_SCREEN_SPRITE);
        Shaku.gfx.useEffect(Shaku.gfx.builtinEffects.MsdfFont);
        Shaku.gfx.drawGroup(generateText("Thanks for", 400, 75, 112, COLOR_LOGO, TextAlignments.Center, logo_font), false);
        Shaku.gfx.drawGroup(generateText("playing!", 400, 200, 112, COLOR_LOGO, TextAlignments.Center, logo_font), false);
        Shaku.gfx.drawGroup(generateText("- knexator", 600, 450, 42, COLOR_LOGO, TextAlignments.Center, logo_font), false);
        // @ts-ignore
        Shaku.gfx.useEffect(null);
    }

    if (state === STATE.GAME && !in_end_screen) {
        // MAIN TURN LOGIC
        let delta_time_left = Shaku.gameTime.delta;

        while (delta_time_left > 0) {
            // first turn is a bit special
            if (cur_turn === 0 && time_offset < 0) {
                time_offset = moveTowards(time_offset, 0, delta_time_left * 4);
                break;
            }
            // Skip empty turns
            if (time_offset < 0) { // forwards                
                if (all_states[cur_turn].empty) {
                    time_offset = 0;
                }
            } else if (time_offset > 0) {
                if (all_states[cur_turn + 1].empty) {
                    time_offset = 0;
                }
            }

            if (time_offset !== 0) {
                let major_turn_dist = Math.abs(all_states[cur_turn].major_turn - selected_turn);
                if (time_offset > 0) major_turn_dist++; // backwards

                let major_turn_duration = 1;
                for (let k = 1; k < major_turn_dist; k++) {
                    major_turn_duration *= power_thing;
                }

                let miniturn_count = all_states[(time_offset > 0) ? cur_turn + 1 : cur_turn].miniturn_siblings_count;
                // Note: miniturn_count * miniturn_scaling must be at most max_miniturns
                let miniturn_scaling = Math.min(max_miniturns / miniturn_count, 1);

                // let boost = turn_dist + 1;
                // boost *= boost * .85;
                let boost = 1;
                if (CONFIG.time === "AUTO" && selected_turn >= robot_tape.length) {
                    boost *= ending_boost;
                    ending_boost += Shaku.gameTime.delta!;
                } else {
                    ending_boost = 1.5;
                }

                let speed = boost / (miniturn_scaling * miniturn_duration * major_turn_duration);
                delta_time_left -= Math.abs(time_offset / speed);
                time_offset = moveTowards(time_offset, 0, Shaku.gameTime.delta! * speed);
            }

            // advance turn, maybe
            if (time_offset === 0 && (all_states[cur_turn].major_turn !== selected_turn || all_states[cur_turn].minor_turn !== 0)) {
                let dir = Math.sign(selected_turn - all_states[cur_turn].major_turn - .5); // -.5 is for minor_turn !== 0
                cur_turn += dir;
                time_offset -= dir * .99;
                if (dir > 0) {
                    all_states[cur_turn].playSounds(1.0);
                }

                if (!EDITOR && !exiting_level && all_states[cur_turn].won && !waiting_for_final_input) {
                    storage.setItem(cur_level.dev_name, "y");
                    time_offset = 0;
                    selected_turn = all_states[cur_turn].major_turn;
                    waiting_for_final_input = true;
                    /*["ex", "aleft", "dright", "sdown", "space", "wup"].forEach(x => {
                        _cooling_time_left[x] += .25;
                    })*/
                }
            }

            if (time_offset === 0) break; // nothing left to do
        }

        if (!exiting_level && !EDITOR && Shaku.input.pressed("dash")) {
            EDITOR = true;
            openCurInEditor();
        }

        if (!EDITOR && !exiting_level && time_offset === 0 && all_states[cur_turn].won) {
            if (cur_level_n < levels.length - 2) {
                initTransitionToLevel(cur_level_n + 1);
            } else {
                initTransitionToExitLevel(() => initTransitionToEnterEnd());
            }
        }
    }

    drawExtra();

    if (state === STATE.MENU) {
        FULL_SCREEN_SPRITE.color = new Color(0, 0, 0, .7);
        Shaku.gfx.drawSprite(FULL_SCREEN_SPRITE);

        let delta_level = selectFromInput([
            [["w", "up"], -menu_row_size],
            [["s", "down"], menu_row_size],
            [["d", "right"], 1],
            [["a", "left"], -1],
        ], Shaku.gameTime.delta);
        if (delta_level !== null) {
            menu_selected_level = mod(menu_selected_level + delta_level, levels.length);
        }
        if (Shaku.input.mouseDelta.length > 0) {
            let selected_i = Math.floor((Shaku.input.mousePosition.x - menu_off_x + 13) / menu_button_spacing);
            let selected_j = Math.floor((Shaku.input.mousePosition.y - menu_off_y + 13) / menu_button_spacing);
            selected_i = clamp(selected_i, 0, menu_row_size - 1);
            selected_j = clamp(selected_j, 0, 2);
            menu_selected_level = selected_j * menu_row_size + selected_i;
        }

        for (let k = 0; k < levels.length; k++) {
            let solved = storage.getItem(levels[k].dev_name) === "y";
            let icon_spr = level_icon_sprites.get(levels[k].public_name);
            if (icon_spr) {
                icon_back.position.copy(icon_spr.position);
                icon_border.position.copy(icon_spr.position);

                icon_border.color = solved
                    ? (k === menu_selected_level ? Color.chartreuse : Color.darkgreen)
                    : (k === menu_selected_level ? Color.cyan : Color.darkcyan);

                Shaku.gfx.drawSprite(icon_back);
                Shaku.gfx.drawSprite(icon_spr);
                Shaku.gfx.drawSprite(icon_border);
            } else {
                Shaku.gfx.fillRect(
                    new Rectangle(
                        (k % menu_row_size) * menu_button_spacing + menu_off_x,
                        Math.floor(k / menu_row_size) * menu_button_spacing + menu_off_y,
                        menu_button_size, menu_button_size
                    ), solved
                    ? (k === menu_selected_level ? Color.chartreuse : Color.darkgreen)
                    : (k === menu_selected_level ? Color.cyan : Color.darkcyan)
                )
            }
        }

        // @ts-ignore
        Shaku.gfx.useEffect(bar_effect);
        // @ts-ignore
        bar_effect.uniforms["u_dark"](.7);
        Shaku.gfx.drawSprite(LOWER_SCREEN_SPRITE);
        // @ts-ignore
        Shaku.gfx.useEffect(null);

        dirs_sprite.sourceRect.y = (Shaku.gameTime.elapsed % 2) < 1 ? 0 : 100;
        undo_sprite.sourceRect.y = (Shaku.gameTime.elapsed % 2) < 1 ? 0 : 50;
        dirs_sprite.position.set(400, 525);
        space_sprite.position.set(150, 550);
        undo_sprite.position.set(150, 485);

        Shaku.gfx.drawSprite(dirs_sprite);
        Shaku.gfx.drawSprite(space_sprite);
        Shaku.gfx.drawSprite(undo_sprite);
        Shaku.gfx.drawSprite(mute_sprite);
        Shaku.gfx.drawSprite(reset_sprite);
    }

    if (state === STATE.INTRO) {

        // FULL_SCREEN_SPRITE.color = new Color(0, 0, 0, 1 - clamp(Shaku.gameTime.elapsed - 2, 0, 1));
        // Shaku.gfx.drawSprite(FULL_SCREEN_SPRITE);

        if (intro_exit_time > 0) {
            intro_exit_time += Shaku.gameTime.delta * 1.5;
            if (intro_exit_time > .5) {
                time_offset = moveTowards(time_offset, 0, Shaku.gameTime.delta * 4);
            }
            if (intro_exit_time >= 1) {
                state = STATE.GAME;
            }
        }

        Shaku.gfx.useEffect(background_effect);
        // @ts-ignore
        background_effect.uniforms["u_alpha"](1 - intro_exit_time * intro_exit_time);
        Shaku.gfx.drawSprite(MAIN_SCREEN_SPRITE);

        Shaku.gfx.useEffect(bar_effect);
        // @ts-ignore
        bar_effect.uniforms["u_alpha"](1 - intro_exit_time * intro_exit_time);
        Shaku.gfx.drawSprite(LOWER_SCREEN_SPRITE);


        Shaku.gfx.useEffect(Shaku.gfx.builtinEffects.MsdfFont);
        logo_group_1.position.y = lerp(10, -400 + 10, intro_exit_time * intro_exit_time);
        logo_group_2.position.y = lerp(136, -400 + 136, intro_exit_time * intro_exit_time);
        Shaku.gfx.drawGroup(logo_group_1, false);
        Shaku.gfx.drawGroup(logo_group_2, false);

        if (intro_exit_time === 0) {
            logo_loading_group._sprites.forEach(s => {
                s.color.a -= Shaku.gameTime.delta * 2;
            });
            // @ts-ignore
            logo_start_group._sprites.forEach(s => {
                s.color.a = clamp(Shaku.gameTime.elapsed - .8, 0, 1);
            });
        } else {
            logo_start_group._sprites.forEach(s => {
                s.color.a -= Shaku.gameTime.delta;
            });
            logo_start_group.position.y = lerp(490, 690, intro_exit_time * intro_exit_time);
        }
        Shaku.gfx.drawGroup(logo_loading_group, false);
        Shaku.gfx.drawGroup(logo_start_group, false);

        // @ts-ignore
        Shaku.gfx.useEffect(null);

        if (state === STATE.GAME) {
            // @ts-ignore
            LOWER_SCREEN_SPRITE.color.a = 1;
        }

        if (Shaku.input.anyKeyPressed || Shaku.input.anyMouseButtonPressed) {
            intro_exit_time += 0.0001;
        }

        // Shaku.endFrame();
        // Shaku.requestAnimationFrame(update);
        // return;
    }

    /*
    let level_name_spr = generateText(cur_level.public_name, 5, 0, 24, Color.white, TextAlignments.Left);
    Shaku.gfx.useEffect(Shaku.gfx.builtinEffects.MsdfFont);
    Shaku.gfx.drawGroup(level_name_spr, false);
    // @ts-ignore
    Shaku.gfx.useEffect(null);
    */

    kalbakUpdate();

    // end frame and request next step
    Shaku.endFrame();
    Shaku.requestAnimationFrame(update);
}

function cancelExitTransition() {
    console.log("cancelling!");
    exit_transition_cancelled = true;
    waiting_for_final_input = false;
    exiting_level = false;
}

function initTransitionToExitLevel(next_thing: Function) {
    let exit_level_time = 0;
    let boost = 1;
    exiting_level = true;
    Shaku.gfx.useEffect(transition_effect);
    if (state === STATE.GAME) {
        // Find the target that had no crate right before winning
        let k = 1;
        let almost_last_turn = all_states[cur_turn - k];
        while (almost_last_turn.minor_turn !== 0) {
            k++;
            almost_last_turn = all_states[cur_turn - k];
        }
        let crates = almost_last_turn.crates;
        let target = almost_last_turn.target;
        let winning_pos = target.positions.filter(p => {
            // return true only if there was no crate here
            return crates.every(c => {
                return !c.pos.equals(p);
            });
        })
        if (winning_pos.length === 0) {
            throw new Error("idk targets thing");
        }
        let screen_pos = winning_pos[0].add(1, 1).mul(TILE_SIZE).sub(level_offset);
        // @ts-ignore
        transition_effect.uniforms["u_pos"](screen_pos.x, screen_pos.y);
    } else if (state === STATE.MENU) {
        // @ts-ignore
        transition_effect.uniforms["u_pos"](
            (menu_selected_level % menu_row_size) * menu_button_spacing + menu_off_x + menu_button_size / 2,
            Math.floor(menu_selected_level / menu_row_size) * menu_button_spacing + menu_off_y + menu_button_size / 2
        );
        exit_level_time = .25;
        boost = 1.5;
    }
    // @ts-ignore
    Shaku.gfx.useEffect(null);

    doEveryFrameUntilTrue(() => {
        Shaku.gfx.useEffect(transition_effect);
        // @ts-ignore
        transition_effect.uniforms["u_progress"](exit_level_time);
        Shaku.gfx.drawSprite(FULL_SCREEN_SPRITE);
        // @ts-ignore
        Shaku.gfx.useEffect(null);

        if (exit_transition_cancelled) {
            exit_level_time = moveTowards(exit_level_time, 0, Shaku.gameTime.delta * 3 / EXIT_TIME);
            if (exit_level_time <= 0) {
                exit_transition_cancelled = false;
                return true;
            }
        } else {
            exit_level_time = moveTowards(exit_level_time, 1, Shaku.gameTime.delta * boost / EXIT_TIME);
            if (exit_level_time >= 1) {
                exiting_level = false;
                next_thing();
                return true;
            }
        }
        return false;
    });
}

function initTransitionToEnterLevel(n: number) {
    let enter_level_time = 0;

    state = STATE.GAME;
    cur_level_n = n;
    load_level(levels[n]);

    Shaku.gfx.useEffect(transition_effect);
    let spawner = initial_state.spawner;
    let screen_pos = spawner.pos.add(spawner.dir.mul(.5)).add(1, 1).mul(TILE_SIZE).sub(level_offset);
    // @ts-ignore
    transition_effect.uniforms["u_pos"](screen_pos.x, screen_pos.y);
    // @ts-ignore
    Shaku.gfx.useEffect(null);

    doEveryFrameUntilTrue(() => {
        Shaku.gfx.useEffect(transition_effect);
        // @ts-ignore
        transition_effect.uniforms["u_progress"](1 - enter_level_time);
        Shaku.gfx.drawSprite(FULL_SCREEN_SPRITE);
        // @ts-ignore
        Shaku.gfx.useEffect(null);


        enter_level_time = moveTowards(enter_level_time, 1, Shaku.gameTime.delta / EXIT_TIME);

        return enter_level_time >= 1;
    });
}

function initTransitionToEnterEnd() {
    let enter_end_time = 0;
    in_end_screen = true;
    Shaku.gfx.useEffect(transition_effect);
    // @ts-ignore
    transition_effect.uniforms["u_pos"](FULL_SCREEN_SPRITE.size.x / 2, FULL_SCREEN_SPRITE.size.y / 2);
    // @ts-ignore
    Shaku.gfx.useEffect(null);
    doEveryFrameUntilTrue(() => {
        Shaku.gfx.useEffect(transition_effect);
        // @ts-ignore
        transition_effect.uniforms["u_progress"](1 - enter_end_time);
        Shaku.gfx.drawSprite(FULL_SCREEN_SPRITE);
        // @ts-ignore
        Shaku.gfx.useEffect(null);

        enter_end_time = moveTowards(enter_end_time, 1, Shaku.gameTime.delta * 3);

        return enter_end_time >= 1;
    });
}

function initTransitionToLevel(n: number) {
    initTransitionToExitLevel(() => initTransitionToEnterLevel(n));
}

let _cooling_time_left: Record<string, number> = {};
let _press_count: Record<string, number> = {};
function pressed_throttled(code: string | string[], dt: number): boolean {
    if (exiting_level && state === STATE.MENU) return false;
    let key = Array.isArray(code) ? code.join('') : code;
    if (!(key in _cooling_time_left)) {
        _cooling_time_left[key] = 0;
        _press_count[key] = 0;
    }
    _cooling_time_left[key] = Math.max(0, _cooling_time_left[key] - dt);
    if (!Shaku.input.down(code)) {
        _press_count[key] = 0;
        _cooling_time_left[key] = 0;
        return false;
    } else if (_cooling_time_left[key] == 0) {
        _press_count[key] += 1;
        _cooling_time_left[key] = _press_count[key] == 1 ? .22 : .08;
        return true;
    }
    return false
}

function moveTowards(cur_val: number, target_val: number, max_delta: number): number {
    if (target_val > cur_val) {
        return Math.min(cur_val + max_delta, target_val);
    } else if (target_val < cur_val) {
        return Math.max(cur_val - max_delta, target_val);
    } else {
        return target_val;
    }
}

function makeRectArray<T>(width: number, height: number, fill: T): T[][] {
    let result: T[][] = [];
    for (let j = 0; j < height; j++) {
        let cur_row: T[] = [];
        for (let i = 0; i < width; i++) {
            cur_row.push(fill);
        }
        result.push(cur_row);
    }
    return result;
}

function forEachTile<T>(map: T[][], func: (tile: T, i: number, j: number) => void) {
    for (let j = 0; j < map.length; j++) {
        let cur_row = map[j];
        for (let i = 0; i < map[0].length; i++) {
            func(cur_row[i], i, j);
        }
    }
}

function selectFromEnum<A, B>(options: [A, B][], value: A): B | null {
    for (const [option, result] of options) {
        if (option === value) {
            return result;
        }
    }
    return null;
}

function selectFromInput<T>(options: [string | string[], T][], dt: number): T | null {
    for (const [key, result] of options) {
        if (pressed_throttled(key, dt)) {
            return result;
        }
    }
    return null;
}

function indexOfTrue<T>(array: T[], fn: (x: T) => boolean): number {
    for (let k = 0; k < array.length; k++) {
        if (fn(array[k])) {
            return k
        }
    }
    return -1;
}

/** Cardinal direction closest to dir */
function mainDir(dir: Vector2) {
    if (Math.abs(dir.x) > Math.abs(dir.y)) {
        return dir.x >= 0 ? Vector2.right : Vector2.left;
    } else {
        return dir.y >= 0 ? Vector2.down : Vector2.up;
    }
}

function remap(value: number, old_a: number, old_b: number, new_a: number, new_b: number) {
    let t = (value - old_a) / (old_b - old_a);
    return t * (new_b - new_a) + new_a;
}

function clamp(value: number, a: number, b: number) {
    if (value < a) return a;
    if (value > b) return b;
    return value;
}

function lerp(a: number, b: number, t: number): number {
    return a * (1 - t) + b * t;
}

function mod(n: number, m: number) {
    return ((n % m) + m) % m;
}

GameTime.reset();
// start main loop
update();