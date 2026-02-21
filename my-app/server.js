const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const server = createServer(async (req, res) => {
        try {
            const parsedUrl = parse(req.url, true);
            await handle(req, res, parsedUrl);
        } catch (err) {
            console.error('Error occurred handling', req.url, err);
            res.statusCode = 500;
            res.end('internal server error');
        }
    });

    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        console.log(`[Socket] A user connected: ${socket.id}`);

        // Facilitator or Participant Joins a Room
        socket.on('join_session', (sessionId) => {
            socket.join(sessionId);
            console.log(`[Socket] User ${socket.id} joined session ${sessionId}`);

            // Broadcast updated count to the room
            const roomSize = io.sockets.adapter.rooms.get(sessionId)?.size || 0;
            io.to(sessionId).emit('participant_count', roomSize);
        });

        // Facilitator updates the room state
        socket.on('set_room_state', ({ sessionId, state, questionIndex }) => {
            // state: 'waiting' | 'importance' | 'performance' | 'completed'
            console.log(`[Socket] Session ${sessionId} state changed to ${state} - Q: ${questionIndex}`);
            io.to(sessionId).emit('room_state_changed', { state, questionIndex });
        });

        socket.on('disconnecting', () => {
            socket.rooms.forEach(room => {
                if (room !== socket.id) {
                    const roomSize = (io.sockets.adapter.rooms.get(room)?.size || 1) - 1;
                    io.to(room).emit('participant_count', roomSize);
                }
            });
        });

        socket.on('disconnect', () => {
            console.log(`[Socket] User disconnected: ${socket.id}`);
        });
    });

    server.once('error', (err) => {
        console.error(err);
        process.exit(1);
    });

    server.listen(port, () => {
        console.log(`> Ready on http://${hostname}:${port}`);
        console.log(`> Socket.io real-time engine attached.`);
    });
});
