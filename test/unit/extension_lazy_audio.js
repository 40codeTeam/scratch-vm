const test = require('tap').test;
const LazyAudio = require('../../src/extensions/scratch3_lazy_audio');

const installFakeDocument = mediaElements => {
    global.document = {
        createElement: type => {
            const media = {
                type,
                currentTime: 3,
                playbackRate: 1,
                volume: 0.5,
                duration: 12,
                buffered: {
                    length: 1,
                    start: index => {
                        if (index !== 0) throw new Error('bad range');
                        return 4;
                    },
                    end: index => {
                        if (index !== 0) throw new Error('bad range');
                        return 8;
                    }
                },
                loadCalled: false,
                playCalled: false,
                pauseCalled: false,
                load () {
                    this.loadCalled = true;
                },
                play () {
                    this.playCalled = true;
                    return Promise.reject(new Error('autoplay blocked'));
                },
                pause () {
                    this.pauseCalled = true;
                }
            };
            mediaElements.push(media);
            return media;
        }
    };
};

test('audio URL inputs do not default to a remote resource', t => {
    const blocks = new LazyAudio({});
    const audioArguments = blocks.getInfo().blocks
        .map(block => block.arguments && block.arguments.AUDIO_ID)
        .filter(Boolean);

    t.equal(audioArguments.length, 12, 'checks every audio URL argument');
    audioArguments.forEach(argument => {
        t.equal(argument.defaultValue, '', 'audio URL default is blank');
    });
    t.end();
});

test('load stores media on the extension instance', t => {
    const previousDocument = global.document;
    t.teardown(() => {
        if (typeof previousDocument === 'undefined') {
            delete global.document;
        } else {
            global.document = previousDocument;
        }
    });

    const mediaElements = [];
    installFakeDocument(mediaElements);

    const blocks = new LazyAudio({});
    blocks.load({AUDIO_ID: 'song.mp3'});

    t.equal(blocks._getAudio('song.mp3').type, 'video', 'keeps the existing video element behavior');
    t.equal(blocks._getAudio('song.mp3').loadCalled, true, 'calls load on the media element');
    t.equal(mediaElements.length, 1);
    t.end();
});

test('media commands and reporters are safe around browser failures', t => {
    const previousDocument = global.document;
    t.teardown(() => {
        if (typeof previousDocument === 'undefined') {
            delete global.document;
        } else {
            global.document = previousDocument;
        }
    });

    const mediaElements = [];
    installFakeDocument(mediaElements);

    const blocks = new LazyAudio({});
    blocks.load({AUDIO_ID: 'song.mp3'});
    blocks.play({AUDIO_ID: 'song.mp3'});
    blocks.pause({AUDIO_ID: 'song.mp3'});

    const media = blocks._getAudio('song.mp3');
    t.equal(media.playCalled, true, 'calls play even if the browser rejects the promise');
    t.equal(media.pauseCalled, true, 'calls pause');

    blocks.sz({AUDIO_ID: 'song.mp3', s: '14'});
    t.equal(media.currentTime, 14, 'casts current time to a number');
    blocks.yl({AUDIO_ID: 'song.mp3', s: 2});
    t.equal(media.volume, 1, 'clamps volume to the browser range');
    blocks.bf2({AUDIO_ID: 'song.mp3', s: '2'});
    t.equal(media.playbackRate, 2, 'casts playback rate to a number');

    t.equal(blocks.cd({AUDIO_ID: 'song.mp3'}), 14);
    t.equal(blocks.bf({AUDIO_ID: 'song.mp3'}), 2);
    t.equal(blocks.zcd({AUDIO_ID: 'song.mp3'}), 12);
    t.equal(blocks.hc({AUDIO_ID: 'song.mp3'}), 1);
    t.equal(blocks.hcs({AUDIO_ID: 'song.mp3', s: 1}), 4);
    t.equal(blocks.hce({AUDIO_ID: 'song.mp3', s: 1}), 8);
    t.equal(blocks.hcs({AUDIO_ID: 'song.mp3', s: 2}), -1, 'invalid buffered ranges report -1');
    t.equal(blocks.cd({AUDIO_ID: 'missing.mp3'}), -1, 'missing media reports -1');
    t.end();
});

test('load is a no-op when document is unavailable', t => {
    const previousDocument = global.document;
    t.teardown(() => {
        if (typeof previousDocument === 'undefined') {
            delete global.document;
        } else {
            global.document = previousDocument;
        }
    });

    delete global.document;

    const blocks = new LazyAudio({});
    blocks.load({AUDIO_ID: 'song.mp3'});

    t.same(blocks._getAudios(), {}, 'keeps storage empty without document');
    t.equal(blocks.cd({AUDIO_ID: 'song.mp3'}), -1);
    t.end();
});
