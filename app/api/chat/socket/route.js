import { Server } from 'socket.io';

const ioHandler = (req, res) => {
    if (!res.socket.server.io) {
        console.log('Initializing Socket.io server...');
        const io = new Server(res.socket.server, {
            path: '/api/chat/socket',
            addTrailingSlash: false,
        });

        io.on('connection', (socket) => {
            console.log('User connected:', socket.id);

            socket.on('join-room', (roomId) => {
                socket.join(roomId);
                console.log(`User ${socket.id} joined room ${roomId}`);
            });

            socket.on('send-message', (data) => {
                // data: { roomId, sender, text, time }
                io.to(data.roomId).emit('receive-message', data);
            });

            socket.on('disconnect', () => {
                console.log('User disconnected:', socket.id);
            });
        });

        res.socket.server.io = io;
    }
    res.end();
};

export const GET = ioHandler;
export const POST = ioHandler;
