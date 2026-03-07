import { Server } from 'socket.io';
import { saveMessage, getMessageHistory } from '@/lib/chat';

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

            socket.on('join-room', async (roomId) => {
                socket.join(roomId);
                console.log(`User ${socket.id} joined room ${roomId}`);

                // Send history to the joining user
                try {
                    const history = await getMessageHistory(roomId);
                    socket.emit('chat-history', history);
                } catch (error) {
                    console.error('Error fetching chat history:', error);
                }
            });

            socket.on('send-message', async (data) => {
                // data: { roomId, sender, senderId (watuId), text, time }

                // Emit to others in the room immediately
                socket.to(data.roomId).emit('receive-message', data);

                // Save to database
                try {
                    await saveMessage({
                        roomId: data.roomId,
                        senderId: data.senderId,
                        senderName: data.sender,
                        text: data.text,
                        time: data.time
                    });
                } catch (error) {
                    console.error('Error saving message:', error);
                }
            });

            socket.on('disconnect', () => {
                console.log('User disconnected:', socket.id);
            });
        });
    }
    res.end();
};

export default SocketHandler;
