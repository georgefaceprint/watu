import { Server } from 'socket.io';

const SocketHandler = (req, res) => {
    if (res.socket.server.io) {
        console.log('Socket is already running');
    } else {
        console.log('Socket is initializing');
        const io = new Server(res.socket.server, {
            path: '/api/socket',
            addTrailingSlash: false,
        });
        res.socket.server.io = io;

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
    }
    res.end();
};

export default SocketHandler;
