import React, { useState, useEffect } from 'react';
import { getPosts, updatePost, schedulePost } from '../api/postApi';
import { Card } from '../components/UI/Card';
import { Modal } from '../components/UI/Modal';
import { Button } from '../components/UI/Button';
import { Input } from '../components/UI/Input';

const CalendarPage = () => {
    const [posts, setPosts] = useState([]);
    const [filters, setFilters] = useState({ LINKEDIN: true, TWITTER_THREAD: true, NEWSLETTER: true });
    const [selectedPost, setSelectedPost] = useState(null);
    const [editDate, setEditDate] = useState('');

    useEffect(() => {
        fetchScheduledPosts();
    }, []);

    const fetchScheduledPosts = async () => {
        try {
            const res = await getPosts({ status: 'SCHEDULED' });
            setPosts(res.posts || []);
        } catch (err) {
            console.error(err);
        }
    };

    const getDaysInMonth = (year, month) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const date = new Date(2026, 7); // August 2026 for now, or just new Date()
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);

    const firstDay = new Date(year, month, 1).getDay();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const padding = Array.from({ length: firstDay }, (_, i) => i);

    const getPostsForDay = (day) => {
        return posts.filter(p => {
            if (!p.scheduledFor) return false;
            const pd = new Date(p.scheduledFor);
            return pd.getDate() === day && pd.getMonth() === month && pd.getFullYear() === year && filters[p.platform];
        });
    };

    const handleEditSchedule = async () => {
        if (!editDate) return;
        try {
            await schedulePost(selectedPost._id, editDate);
            setSelectedPost(null);
            fetchScheduledPosts();
        } catch (err) {
            console.error(err);
        }
    };

    const handleUnschedule = async () => {
        try {
            await updatePost(selectedPost._id, { status: 'DRAFT' });
            setSelectedPost(null);
            fetchScheduledPosts();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Content Calendar</h1>
                <div className="flex gap-4">
                    {['LINKEDIN', 'TWITTER_THREAD', 'NEWSLETTER'].map(platform => (
                        <label key={platform} className="flex items-center gap-2 cursor-pointer text-sm font-medium">
                            <input
                                type="checkbox"
                                checked={filters[platform]}
                                onChange={() => setFilters(prev => ({ ...prev, [platform]: !prev[platform] }))}
                                className="rounded text-blue-600 focus:ring-blue-500"
                            />
                            {platform.replace('_', ' ')}
                        </label>
                    ))}
                </div>
            </div>

            <Card className="p-6">
                <div className="text-center font-bold text-xl mb-4">
                    {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </div>

                <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200 rounded-lg overflow-hidden">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="bg-gray-50 py-2 text-center text-sm font-semibold text-gray-700">
                            {day}
                        </div>
                    ))}

                    {padding.map((_, i) => (
                        <div key={`pad-${i}`} className="bg-white min-h-[120px]"></div>
                    ))}

                    {days.map(day => {
                        const dayPosts = getPostsForDay(day);
                        return (
                            <div key={day} className="bg-white min-h-[120px] p-2 flex flex-col gap-1 border-t border-gray-100 hover:bg-gray-50 transition-colors">
                                <div className="text-right text-sm text-gray-500 font-medium">{day}</div>
                                <div className="flex flex-col gap-1 overflow-y-auto">
                                    {dayPosts.map(post => (
                                        <div
                                            key={post._id}
                                            onClick={() => {
                                                setSelectedPost(post);
                                                setEditDate(new Date(post.scheduledFor).toISOString().slice(0, 16));
                                            }}
                                            className={`text-xs px-2 py-1 rounded truncate cursor-pointer shadow-sm
                        ${post.platform === 'LINKEDIN' ? 'bg-blue-100 text-blue-800 border border-blue-200 hover:bg-blue-200' : ''}
                        ${post.platform === 'TWITTER_THREAD' ? 'bg-sky-100 text-sky-800 border border-sky-200 hover:bg-sky-200' : ''}
                        ${post.platform === 'NEWSLETTER' ? 'bg-purple-100 text-purple-800 border border-purple-200 hover:bg-purple-200' : ''}
                      `}
                                        >
                                            {new Date(post.scheduledFor).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {post.sourceId?.title || 'Unknown Source'}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Card>

            <Modal
                isOpen={!!selectedPost}
                onClose={() => setSelectedPost(null)}
                title="Edit Schedule"
            >
                {selectedPost && (
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm font-semibold mb-2">Platform: {selectedPost.platform}</p>
                            <Input
                                type="datetime-local"
                                value={editDate}
                                onChange={e => setEditDate(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-4">
                            <Button onClick={handleEditSchedule} className="flex-1">Update Schedule</Button>
                            <Button onClick={handleUnschedule} variant="secondary" className="flex-1 text-red-600 hover:text-red-700">Cancel Schedule</Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default CalendarPage;
