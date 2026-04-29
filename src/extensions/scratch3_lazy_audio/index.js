const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Cast = require('../../util/cast');

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const DEFAULT_AUDIO_ID = '';
/**
 * Icon svg to be displayed at the left edge of each extension block, encoded as a data URI.
 * @type {string}
 */
// eslint-disable-next-line max-len
const blockIconURI = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSLlm77lsYJfMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeD0iMHB4IiB5PSIwcHgiCgkgdmlld0JveD0iLTUwMyAyMTcgMTI4IDEyOCIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAtNTAzIDIxNyAxMjggMTI4OyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+CjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI+Cgkuc3Qwe2ZpbGw6I0ZGRkZGRjt9Cjwvc3R5bGU+Cjx0aXRsZT5tdXNpYy1ibG9jay1pY29uPC90aXRsZT4KPHBhdGggY2xhc3M9InN0MCIgZD0iTS00NzcuNCwzMjMuMmMtMTMuOSwwLTI1LjEtMTEuNi0yNS4xLTI1LjljMC0xNCwxMC44LTI1LjUsMjQuMy0yNS45YzAuNi0xMSw5LjUtMTkuNywyMC4zLTE5LjcKCWMxLjUsMCwzLjEsMC4yLDQuNSwwLjVjNi4zLTEwLDE3LjItMTYuNywyOS42LTE2LjdjMTkuNCwwLDM1LjEsMTYuMiwzNS4xLDM2LjNjMCwwLjksMCwxLjgtMC4xLDIuN2M3LjgsNC40LDEzLjEsMTIuOSwxMy4xLDIyLjcKCWMwLDE0LjMtMTEuMiwyNS45LTI1LjEsMjUuOUgtNDc3LjR6IE0tNDMzLjUsMzA1LjJjLTEwLjMtNDYuMS04LjQtMzMuMS0wLjYtMzFjNy44LDIuMSwxOS43LTEwLDcuNy04LjFjLTEyLDEuOS0yMi45LTIwLjEtMTguNSw1LjgKCWMzLjYsMjAuOSw1LjcsMjUuNywzLjksMjUuN2MtMC42LTAuMy0xLjMtMC41LTItMC42Yy0xLjMtMC4zLTIuNi0wLjUtNC0wLjVjLTYuNSwwLTEwLjksMy45LTEwLDguN2MwLjksNC44LDYuOSw4LjcsMTMuNCw4LjcKCUMtNDM3LDMxMy45LTQzMi41LDMxMC4xLTQzMy41LDMwNS4yTC00MzMuNSwzMDUuMnoiLz4KPC9zdmc+';

/**
 * Icon svg to be displayed in the category menu, encoded as a data URI.
 * @type {string}
 */
// eslint-disable-next-line max-len
const menuIconURI = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSLlm77lsYJfMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeD0iMHB4IiB5PSIwcHgiCgkgdmlld0JveD0iLTQxNSAyMTcgMTI4IDEyOCIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAtNDE1IDIxNyAxMjggMTI4OyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+Cjx0aXRsZT5tdXNpYy1ibG9jay1pY29uPC90aXRsZT4KPHBhdGggc3R5bGU9ImZpbGw6IzEyOTZEQjsiIGQ9Ik0tMzg5LjMsMzI0LjhjLTEzLjksMC0yNS4xLTExLjYtMjUuMS0yNS45YzAtMTQsMTAuOC0yNS41LDI0LjMtMjUuOWMwLjYtMTEsOS41LTE5LjcsMjAuMy0xOS43CgljMS41LDAsMy4xLDAuMiw0LjUsMC41YzYuMy0xMCwxNy4yLTE2LjcsMjkuNi0xNi43YzE5LjQsMCwzNS4xLDE2LjIsMzUuMSwzNi4zYzAsMC45LDAsMS44LTAuMSwyLjdjNy44LDQuNCwxMy4xLDEyLjksMTMuMSwyMi43CgljMCwxNC4zLTExLjIsMjUuOS0yNS4xLDI1LjlMLTM4OS4zLDMyNC44TC0zODkuMywzMjQuOHoiLz4KPHBhdGggc3R5bGU9ImZpbGw6I0ZGRkZGRjsiIGQ9Ik0tMzQ1LjQsMzA2LjhjLTEwLjMtNDYuMS04LjQtMzMuMS0wLjYtMzFjNy44LDIuMSwxOS43LTEwLDcuNy04LjFjLTEyLDEuOS0yMi45LTIwLjEtMTguNSw1LjgKCWMzLjYsMjAuOSw1LjcsMjUuNywzLjksMjUuN2MtMC42LTAuMy0xLjMtMC41LTItMC42Yy0xLjMtMC4zLTIuNi0wLjUtNC0wLjVjLTYuNSwwLTEwLjksMy45LTEwLDguN3M2LjksOC43LDEzLjQsOC43CglDLTM0OC45LDMxNS41LTM0NC40LDMxMS44LTM0NS40LDMwNi44TC0zNDUuNCwzMDYuOHoiLz4KPC9zdmc+';

/**
 * @typedef {object} PenState - the pen state associated with a particular target.
 * @property {Boolean} penDown - tracks whether the pen should draw for this target.
 * @property {number} color - the current color (hue) of the pen.
 * @property {PenAttributes} penAttributes - cached pen attributes for the renderer. This is the authoritative value for
 *   diameter but not for pen color.
 */

/**
 * Host for the Pen-related blocks in Scratch 3.0
 * @param {Runtime} runtime - the runtime instantiating this block package.
 * @constructor
 */
class Scratch3LazyAudioBlocks {
    constructor(runtime) {
        /**
         * The runtime instantiating this block package.
         * @type {Runtime}
         */
        this.runtime = runtime;
        this._audioState = {
            music: {}
        };
        this._bufferedAudios = {};
    }

    _resetAudios() {
        this._bufferedAudios = {};
    }
    /**
     * @returns {object} metadata for this extension and its blocks.
     */
    getInfo() {
        return {
            id: 'lazyAudio',
            name: 'LazyAudio',
            menuIconURI: menuIconURI,
            blockIconURI: blockIconURI,
            color1:'#9C27B0',
            blocks: [{
                opcode: 'load',
                blockType: BlockType.COMMAND,
                text: '加载([AUDIO_ID])',
                arguments: {
                    AUDIO_ID: {
                        type: ArgumentType.STRING,
                        defaultValue: DEFAULT_AUDIO_ID
                    }
                }
            },
            {
                opcode: 'play',
                blockType: BlockType.COMMAND,
                text: '播放([AUDIO_ID])',
                arguments: {
                    AUDIO_ID: {
                        type: ArgumentType.STRING,
                        defaultValue: DEFAULT_AUDIO_ID
                    }
                }
            },
            {
                opcode: 'pause',
                blockType: BlockType.COMMAND,
                text: '暂停([AUDIO_ID])',
                arguments: {
                    AUDIO_ID: {
                        type: ArgumentType.STRING,
                        defaultValue: DEFAULT_AUDIO_ID
                    }
                }
            },
            {
                opcode: 'pauseAll',
                blockType: BlockType.COMMAND,
                text: '暂停全部',
                arguments: {

                }
            },
            {
                opcode: 'cd',
                blockType: BlockType.REPORTER,
                text: '获取当前播放秒数([AUDIO_ID])',
                arguments: {
                    AUDIO_ID: {
                        type: ArgumentType.STRING,
                        defaultValue: DEFAULT_AUDIO_ID
                    }
                }
            },
            {
                opcode: 'zcd',
                blockType: BlockType.REPORTER,
                text: '获取音频总长度(秒)([AUDIO_ID])',
                arguments: {
                    AUDIO_ID: {
                        type: ArgumentType.STRING,
                        defaultValue: DEFAULT_AUDIO_ID
                    }
                }
            },
            {
                opcode: 'sz',
                blockType: BlockType.COMMAND,
                text: '设置音频([AUDIO_ID])播放秒数[s]',
                arguments: {
                    AUDIO_ID: {
                        type: ArgumentType.STRING,
                        defaultValue: DEFAULT_AUDIO_ID
                    },
                    s: {
                        type: ArgumentType.NUMBER,
                        defaultValue: 14
                    }
                }
            },
            {
                opcode: 'bf',
                blockType: BlockType.REPORTER,
                text: '获取音频播放速度([AUDIO_ID])',
                arguments: {
                    AUDIO_ID: {
                        type: ArgumentType.STRING,
                        defaultValue: DEFAULT_AUDIO_ID
                    }
                }
            },
            {
                opcode: 'bf2',
                blockType: BlockType.COMMAND,
                text: '设置音频([AUDIO_ID])播放速度[s]',
                arguments: {
                    AUDIO_ID: {
                        type: ArgumentType.STRING,
                        defaultValue: DEFAULT_AUDIO_ID
                    },
                    s: {
                        type: ArgumentType.NUMBER,
                        defaultValue: 2
                    }
                }
            },
            {
                opcode: 'yl',
                blockType: BlockType.COMMAND,
                text: '设置音频([AUDIO_ID])音量[s]',
                arguments: {
                    AUDIO_ID: {
                        type: ArgumentType.STRING,
                        defaultValue: DEFAULT_AUDIO_ID
                    },
                    s: {
                        type: ArgumentType.NUMBER,
                        defaultValue: 0.14
                    }
                }
            },
            {
                opcode: 'hc',
                blockType: BlockType.REPORTER,
                text: '获取音频([AUDIO_ID])缓冲片段数',
                arguments: {
                    AUDIO_ID: {
                        type: ArgumentType.STRING,
                        defaultValue: DEFAULT_AUDIO_ID
                    }
                }
            },
            {
                opcode: 'hcs',
                blockType: BlockType.REPORTER,
                text: '获取音频([AUDIO_ID])[s]片段的开始时间',
                arguments: {
                    AUDIO_ID: {
                        type: ArgumentType.STRING,
                        defaultValue: DEFAULT_AUDIO_ID
                    },
                    s: {
                        type: ArgumentType.NUMBER,
                        defaultValue: '1'
                    }
                }
            },
            {
                opcode: 'hce',
                blockType: BlockType.REPORTER,
                text: '获取音频([AUDIO_ID])[s]片段结束时间',
                arguments: {
                    AUDIO_ID: {
                        type: ArgumentType.STRING,
                        defaultValue: DEFAULT_AUDIO_ID
                    },
                    s: {
                        type: ArgumentType.NUMBER,
                        defaultValue: '1'
                    }
                }
            },
            ],
            menus: {}
        };
    }
    _getAudioState() {
        if (!this._audioState.music || typeof this._audioState.music !== 'object') {
            this._audioState.music = {};
        }
        return this._audioState;
    }

    _ad() {
        return this._getAudios();
    }

    _getAudios() {
        return this._getAudioState().music;
    }

    _getAudio(audioId) {
        return this._getAudios()[Cast.toString(audioId)];
    }

    _createAudioElement(src) {
        if (typeof document === 'undefined' || typeof document.createElement !== 'function') {
            return null;
        }

        const media = document.createElement('video');
        media.preload = 'auto';
        media.src = src;
        if (src.toLowerCase().indexOf('.mp4') !== -1) {
            media.crossOrigin = 'anonymous';
        }
        return media;
    }

    _safeMediaCall(media, method) {
        if (!media || typeof media[method] !== 'function') return;
        try {
            const result = media[method]();
            if (result && typeof result.catch === 'function') {
                result.catch(() => {});
            }
        } catch (e) {
            // Browser media APIs can throw for autoplay, CORS, or unsupported sources.
        }
    }

    _safeSetMediaProperty(media, property, value) {
        if (!media) return;
        try {
            media[property] = value;
        } catch (e) {
            // Keep Scratch scripts running even when a browser rejects a media value.
        }
    }

    _safeNumber(value) {
        return typeof value === 'number' && !Number.isNaN(value) ? value : -1;
    }

    _getMediaNumber(media, property) {
        if (!media) return -1;
        return this._safeNumber(media[property]);
    }

    _getBufferedTime(media, index, method) {
        const buffered = media && media.buffered;
        const rangeIndex = Math.floor(Cast.toNumber(index)) - 1;
        if (!buffered || rangeIndex < 0 || rangeIndex >= buffered.length ||
                typeof buffered[method] !== 'function') {
            return -1;
        }
        try {
            return this._safeNumber(buffered[method](rangeIndex));
        } catch (e) {
            return -1;
        }
    }

    load(args, util) {
        const src = Cast.toString(args.AUDIO_ID);
        if (!src) return;

        const audios = this._getAudios();
        if (audios[src]) {
            this._safeSetMediaProperty(audios[src], 'currentTime', 0);
            return;
        }

        const media = this._createAudioElement(src);
        if (!media) return;

        audios[src] = media;
        this._safeMediaCall(media, 'load');
    }

    play(args, util) {
        this._safeMediaCall(this._getAudio(args.AUDIO_ID), 'play');
    }

    pause(args, util) {
        this._safeMediaCall(this._getAudio(args.AUDIO_ID), 'pause');
    }

    pauseAll(args, util) {
        const audios = this._getAudios();
        Object.keys(audios).forEach(audioId => {
            this._safeMediaCall(audios[audioId], 'pause');
        });
    }

    cd(args, util) {
        return this._getMediaNumber(this._getAudio(args.AUDIO_ID), 'currentTime');
    }

    bf(args, util) {
        return this._getMediaNumber(this._getAudio(args.AUDIO_ID), 'playbackRate');
    }

    zcd(args, util) {
        return this._getMediaNumber(this._getAudio(args.AUDIO_ID), 'duration');
    }

    hc(args, util) {
        const media = this._getAudio(args.AUDIO_ID);
        return media && media.buffered ? media.buffered.length : -1;
    }

    hcs(args, util) {
        return this._getBufferedTime(this._getAudio(args.AUDIO_ID), args.s, 'start');
    }

    hce(args, util) {
        return this._getBufferedTime(this._getAudio(args.AUDIO_ID), args.s, 'end');
    }

    sz(args, util) {
        const seconds = Cast.toNumber(args.s);
        if (!Number.isFinite(seconds)) return;
        this._safeSetMediaProperty(this._getAudio(args.AUDIO_ID), 'currentTime', Math.max(0, seconds));
    }

    bf2(args, util) {
        const rate = Cast.toNumber(args.s);
        if (!Number.isFinite(rate)) return;
        this._safeSetMediaProperty(this._getAudio(args.AUDIO_ID), 'playbackRate', rate);
    }

    yl(args, util) {
        const volume = Cast.toNumber(args.s);
        if (!Number.isFinite(volume)) return;
        this._safeSetMediaProperty(this._getAudio(args.AUDIO_ID), 'volume', clamp(volume, 0, 1));
    }
}

module.exports = Scratch3LazyAudioBlocks;
