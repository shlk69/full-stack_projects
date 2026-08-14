import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

export const useSocket = (projectId) => {
    const socketRef = useRef();

    useEffect(() => {
        // Assume API baseUrl is localhost:5000 in dev
        const socketUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

        socketRef.current = io(socketUrl, {
            withCredentials: true // send cookies
        });

        if (projectId) {
            socketRef.current.emit('project:join', projectId);
        }

        socketRef.current.on('connect_error', (err) => {
            console.error('Socket connection error', err);
        });

        return () => {
            if (projectId) {
                socketRef.current.emit('project:leave', projectId);
            }
            socketRef.current.disconnect();
        };
    }, [projectId]);

    return socketRef.current;
};
