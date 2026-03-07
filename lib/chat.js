import { executeQuery } from './neo4j';

/**
 * Saves a chat message to the database.
 * @param {Object} msg - The message object { roomId, senderId, senderName, text, time }
 */
export async function saveMessage(msg) {
    const query = `
        MATCH (u:Person {id: $senderId})
        CREATE (m:ChatMessage {
            text: $text,
            createdAt: datetime(),
            roomId: $roomId,
            senderName: $senderName,
            timeLabel: $time
        })
        CREATE (u)-[:SENT]->(m)
        RETURN m
    `;
    await executeQuery(query, {
        senderId: msg.senderId,
        senderName: msg.senderName,
        text: msg.text,
        roomId: msg.roomId,
        time: msg.time
    });
}

/**
 * Retrieves message history for a specific room.
 * @param {string} roomId - The ID of the room (e.g., 'group-1')
 * @param {number} limit - Number of messages to retrieve
 */
export async function getMessageHistory(roomId, limit = 50) {
    const query = `
        MATCH (m:ChatMessage {roomId: $roomId})
        MATCH (u:Person)-[:SENT]->(m)
        RETURN m.text as text, 
               m.senderName as sender, 
               u.id as senderId, 
               m.timeLabel as time,
               m.createdAt as createdAt
        ORDER BY m.createdAt ASC
        LIMIT $limit
    `;
    const records = await executeQuery(query, { roomId, limit });
    return records.map(record => ({
        text: record.get('text'),
        sender: record.get('sender'),
        senderId: record.get('senderId'),
        time: record.get('time'),
        createdAt: record.get('createdAt').toString()
    }));
}
