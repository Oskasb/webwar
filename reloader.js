#!/usr/bin/env node


    var args = ['server.js'];
    var files = [
        'server.js',
        'Transport/MATH',
        'Transport/GAME',
        'Transport/MODEL',
        'Transport/ACTIONS',
        'Transport/io/SocketMessages',
        'Server/io/ServerConnection',
        'Transport/io/Message',
        'Server/io/ConnectedClient',
        'Server/io/ActiveClients',
        'Server/DataHub',
        'Server/Game/ServerAttachmentPoint',
        'Server/Game/ServerModule',
        'Server/Game/GridSector',
        'Server/Game/PieceSpawner',
        'Server/Game/SectorGrid',
        'Server/Game/ServerWorld',
        'Server/Game/ServerGameMain',
        'Server/Game/ServerPieceProcessor',
        'Server/Game/ServerCollisionDetection',
        'Server/ServerMain',
        'Server/Game/ServerPlayer',
        'Server/io/ConfigLoader'
    ];


    var fs = require('fs')
        , exec = require('child_process').exec
        , spawn = require('child_process').spawn
        , child = null
        , double_dashes = false
        , i = 0;

    process.stdin.resume();
    process.stdin.setEncoding('utf8');

    process.stdin.on('data', function (chunk) {
        watch(chunk.split('\n'));
    });
    process.stdin.on('close', function () {
        start();
    });

    process.argv.forEach(function (arg) {
        if (++i < 3) {
            return;
        }
        if (arg == '--') {
            double_dashes = true;
            return;
        }
        if (double_dashes) {
            files.push(arg);
        }
        else {
            args.push(arg);
        }
    });

    watch(files);
    if (files.length > 0) {
        start();
    }

    function reload() {
        stop();
        start();
    }

    function stop() {
        if (child === null) {
            return;
        }
        child.kill();
    }

    function start() {
        if (child !== null
            && !child.killed) {
            return;
        }
        var opts = {customFds: [process.stdin, process.stdout, process.stderr],
            cwd: process.cwd()};
        child = spawn('node', args, opts);
    }

    function watch(files) {
        files.forEach(function (filename) {
            console.log('watchFile:'+filename+'.js');
            fs.watchFile(filename+'.js', function (curr, prev) {
                if (+curr.mtime !== +prev.mtime) {
                    reload();
                }
            });
        });
    }