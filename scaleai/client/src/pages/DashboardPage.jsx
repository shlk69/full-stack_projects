import React, { useEffect, useState } from 'react';
import { getSources, deleteSource } from '../api/sourceApi';
import { getPosts } from '../api/postApi';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { useNavigate } from 'react-router-dom';

const DashboardPage = () => {
    const [sources, setSources] = useState([]);
    const [posts, setPosts] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const srcRes = await getSources();
            const postRes = await getPosts();
            setSources(srcRes.sources || []);
            setPosts(postRes.posts || []);
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this source and all its posts?')) {
            try {
                await deleteSource(id);
                fetchData();
            } catch (err) {
                console.error(err);
            }
        }
    };

    const scheduledCount = posts.filter(p => p.status === 'SCHEDULED').length;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="flex flex-col items-center justify-center p-6 bg-blue-50 border-blue-100">
                    <div className="text-4xl font-bold text-blue-600">{sources.length}</div>
                    <div className="text-gray-600 mt-2">Sources Ingested</div>
                </Card>
                <Card className="flex flex-col items-center justify-center p-6 bg-green-50 border-green-100">
                    <div className="text-4xl font-bold text-green-600">{posts.length}</div>
                    <div className="text-gray-600 mt-2">Posts Generated</div>
                </Card>
                <Card className="flex flex-col items-center justify-center p-6 bg-purple-50 border-purple-100">
                    <div className="text-4xl font-bold text-purple-600">{scheduledCount}</div>
                    <div className="text-gray-600 mt-2">Posts Scheduled</div>
                </Card>
            </div>

            <Card>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Recent Sources</h2>
                    <Button onClick={() => navigate('/editor')}>New Source</Button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b">
                                <th className="py-3 px-4 font-semibold text-gray-700">Title</th>
                                <th className="py-3 px-4 font-semibold text-gray-700">Type</th>
                                <th className="py-3 px-4 font-semibold text-gray-700">Characters</th>
                                <th className="py-3 px-4 font-semibold text-gray-700">Created</th>
                                <th className="py-3 px-4 font-semibold text-gray-700 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sources.length === 0 ? (
                                <tr><td colSpan="5" className="py-4 text-center text-gray-500">No sources found</td></tr>
                            ) : (
                                sources.map(source => (
                                    <tr key={source._id} className="border-b hover:bg-gray-50">
                                        <td className="py-3 px-4 max-w-xs truncate">{source.title}</td>
                                        <td className="py-3 px-4">
                                            <span className="px-2 py-1 text-xs rounded-full bg-gray-200 text-gray-800 font-medium">
                                                {source.sourceType}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">{source.characterCount}</td>
                                        <td className="py-3 px-4">{new Date(source.createdAt).toLocaleDateString()}</td>
                                        <td className="py-3 px-4 text-right">
                                            <Button variant="secondary" className="mr-2 text-xs py-1 px-2" onClick={() => navigate('/editor', { state: { source } })}>Open</Button>
                                            <Button variant="danger" className="text-xs py-1 px-2" onClick={() => handleDelete(source._id)}>Delete</Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default DashboardPage;
