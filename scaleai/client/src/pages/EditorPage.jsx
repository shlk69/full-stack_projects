import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { createSource } from '../api/sourceApi';
import { generatePosts } from '../api/aiApi';
import { getPosts, schedulePost } from '../api/postApi';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Input } from '../components/UI/Input';
import { Modal } from '../components/UI/Modal';

const EditorPage = () => {
    const location = useLocation();
    const [source, setSource] = useState(location.state?.source || null);
    const [formData, setFormData] = useState({ title: '', sourceType: 'BLOG', rawContent: '' });
    const [loading, setLoading] = useState(false);
    const [posts, setPosts] = useState([]);
    const [activeTab, setActiveTab] = useState('LINKEDIN');
    const [scheduleModalParams, setScheduleModalParams] = useState({ isOpen: false, postId: null, date: '' });

    useEffect(() => {
        if (source) {
            fetchPosts(source._id);
        }
    }, [source]);

    const fetchPosts = async (sourceId) => {
        try {
            const res = await getPosts();
            // filter posts by this source id locally
            const relatedPosts = res.posts.filter(p => p.sourceId._id === sourceId || p.sourceId === sourceId);
            setPosts(relatedPosts);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSaveSource = async () => {
        if (!formData.title || !formData.rawContent) return alert('Title and content required');
        try {
            const res = await createSource(formData);
            setSource(res.source);
        } catch (err) {
            alert('Error creating source');
        }
    };

    const handleGenerate = async () => {
        if (!source) return;
        setLoading(true);
        try {
            await generatePosts(source._id);
            await fetchPosts(source._id);
        } catch (err) {
            alert('Generation failed');
        } finally {
            setLoading(false);
        }
    };

    const handleSchedule = async () => {
        try {
            await schedulePost(scheduleModalParams.postId, scheduleModalParams.date);
            setScheduleModalParams({ isOpen: false, postId: null, date: '' });
            fetchPosts(source._id);
        } catch (err) {
            alert('Schedule failed');
        }
    };

    const renderContent = () => {
        const post = posts.find(p => p.platform === activeTab);
        if (!post) return <div className="text-gray-500 text-center py-10">No drafted content. Click Generate.</div>;

        const content = post.content;

        return (
            <div className="flex flex-col h-full">
                <div className="flex-1 mb-4 overflow-y-auto">
                    {activeTab === 'TWITTER_THREAD' ? (
                        <div className="space-y-4">
                            {Array.isArray(content) ? content.map((tweet, i) => (
                                <Card key={i} className="bg-white">
                                    <div className="text-sm font-semibold text-gray-500 mb-1">Tweet {i + 1}</div>
                                    <textarea className="w-full text-gray-800 resize-none border-none focus:outline-none" rows={4} defaultValue={tweet} />
                                    <div className="text-right text-xs text-gray-400 mt-2">{tweet.length} / 280</div>
                                </Card>
                            )) : (
                                <textarea className="w-full h-64 p-4 border rounded" defaultValue={String(content)} />
                            )}
                        </div>
                    ) : (
                        <textarea className="w-full h-full min-h-[300px] p-4 border rounded font-sans leading-relaxed" defaultValue={content} />
                    )}
                </div>
                <div className="flex justify-between items-center bg-gray-50 p-4 border-t">
                    <span className="text-sm text-gray-500">Status: <span className="font-semibold text-gray-700">{post.status}</span></span>
                    <Button onClick={() => setScheduleModalParams({ isOpen: true, postId: post._id, date: '' })}>
                        Schedule Post
                    </Button>
                </div>
            </div>
        );
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full pb-10">
            {/* Source Panel */}
            <Card className="flex flex-col h-[calc(100vh-120px)] overflow-hidden">
                <h2 className="text-xl font-semibold mb-4 shrink-0">Source Document</h2>

                {!source ? (
                    <div className="flex-1 flex flex-col space-y-4 overflow-y-auto pr-2">
                        <Input placeholder="Title" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                        <select
                            className="px-3 py-2 border rounded-md"
                            value={formData.sourceType}
                            onChange={e => setFormData({ ...formData, sourceType: e.target.value })}
                        >
                            <option value="BLOG">Blog Section</option>
                            <option value="TRANSCRIPT">Transcript</option>
                            <option value="RAW_NOTES">Raw Notes</option>
                        </select>
                        <textarea
                            className="flex-1 border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            placeholder="Paste raw content here..."
                            value={formData.rawContent}
                            onChange={e => setFormData({ ...formData, rawContent: e.target.value })}
                        ></textarea>
                        <Button onClick={handleSaveSource} className="w-full mt-2">Save Source</Button>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col overflow-hidden">
                        <div className="mb-4 bg-gray-50 p-4 rounded-lg flex justify-between items-center shrink-0">
                            <div>
                                <h3 className="font-semibold">{source.title}</h3>
                                <p className="text-sm text-gray-500">{source.sourceType} • {source.characterCount} chars</p>
                            </div>
                            <Button variant="secondary" onClick={() => setSource(null)}>Change</Button>
                        </div>

                        <textarea
                            className="flex-1 border rounded-md p-4 bg-gray-50 text-gray-700 resize-none w-full"
                            readOnly
                            value={source.rawContent}
                        ></textarea>

                        <Button
                            onClick={handleGenerate}
                            disabled={loading}
                            className="w-full mt-4 h-12 text-lg shrink-0 flex justify-center items-center"
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : 'Generate with ScaleAI'}
                        </Button>
                    </div>
                )}
            </Card>

            {/* Output Studio Panel */}
            <Card className="flex flex-col h-[calc(100vh-120px)] p-0 overflow-hidden">
                <div className="flex border-b shrink-0">
                    {['LINKEDIN', 'TWITTER_THREAD', 'NEWSLETTER'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-3 text-sm font-medium ${activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            {tab.replace('_', ' ')}
                        </button>
                    ))}
                </div>

                <div className="flex-1 p-4 overflow-hidden bg-gray-50">
                    {renderContent()}
                </div>
            </Card>

            <Modal
                title="Schedule Post"
                isOpen={scheduleModalParams.isOpen}
                onClose={() => setScheduleModalParams({ isOpen: false, postId: null, date: '' })}
            >
                <div className="space-y-4">
                    <Input
                        type="datetime-local"
                        value={scheduleModalParams.date}
                        onChange={e => setScheduleModalParams({ ...scheduleModalParams, date: e.target.value })}
                    />
                    <Button className="w-full" onClick={handleSchedule}>Confirm Schedule</Button>
                </div>
            </Modal>
        </div>
    );
};

export default EditorPage;
