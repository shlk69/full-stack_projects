import React, { useState, useEffect } from 'react';
import { getBrandVoice, updateBrandVoice } from '../api/userApi';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Input } from '../components/UI/Input';

const BrandVoicePage = () => {
    const [formData, setFormData] = useState({
        tone: '',
        guidelines: '',
        samplePosts: []
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        fetchBrandVoice();
    }, []);

    const fetchBrandVoice = async () => {
        try {
            const res = await getBrandVoice();
            if (res.brandVoice) {
                setFormData(res.brandVoice);
            }
        } catch (err) {
            console.error('Failed to fetch brand voice', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddSample = () => {
        setFormData(prev => ({
            ...prev,
            samplePosts: [...prev.samplePosts, '']
        }));
    };

    const handleUpdateSample = (index, value) => {
        const newSamples = [...formData.samplePosts];
        newSamples[index] = value;
        setFormData(prev => ({ ...prev, samplePosts: newSamples }));
    };

    const handleRemoveSample = (index) => {
        const newSamples = formData.samplePosts.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, samplePosts: newSamples }));
    };

    const handleSave = async () => {
        setSaving(true);
        setSuccessMsg('');
        try {
            await updateBrandVoice(formData);
            setSuccessMsg('Brand voice updated successfully!');
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (err) {
            alert('Failed to update brand voice');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Brand Voice Settings</h1>
                {successMsg && <span className="text-sm text-green-600 bg-green-100 px-3 py-1 rounded-full font-medium">{successMsg}</span>}
            </div>

            <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Target Tone Profile</h2>
                <Input
                    value={formData.tone}
                    onChange={e => setFormData({ ...formData, tone: e.target.value })}
                    placeholder="e.g., Professional, direct, and authoritative"
                />
            </Card>

            <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Voice Rules & Constraints</h2>
                <textarea
                    className="w-full border rounded-md p-3 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.guidelines}
                    onChange={e => setFormData({ ...formData, guidelines: e.target.value })}
                    placeholder="e.g., Use active voice. Avoid corporate jargon."
                />
            </Card>

            <Card className="p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Sample High-Performing Posts</h2>
                    <Button variant="secondary" onClick={handleAddSample} className="text-sm py-1">Add Sample</Button>
                </div>

                <div className="space-y-4">
                    {formData.samplePosts.map((sample, i) => (
                        <div key={i} className="flex gap-3 relative group">
                            <textarea
                                className="flex-1 border rounded-md p-3 min-h-[100px] text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={sample}
                                onChange={e => handleUpdateSample(i, e.target.value)}
                                placeholder={`Sample Post ${i + 1}`}
                            />
                            <button
                                onClick={() => handleRemoveSample(i)}
                                className="absolute top-2 right-2 text-gray-400 hover:text-red-500 bg-white rounded bg-opacity-80 p-1"
                                title="Remove sample"
                            >
                                &times;
                            </button>
                        </div>
                    ))}

                    {formData.samplePosts.length === 0 && (
                        <div className="text-center text-gray-500 py-6 border-2 border-dashed rounded-lg">
                            No sample posts added. Add samples to help ScaleAI understand your style.
                        </div>
                    )}
                </div>
            </Card>

            <div className="flex justify-end pt-4 pb-12">
                <Button onClick={handleSave} disabled={saving} className="w-1/3 min-w-[200px]">
                    {saving ? 'Saving...' : 'Save AI Configuration'}
                </Button>
            </div>
        </div>
    );
};

export default BrandVoicePage;
