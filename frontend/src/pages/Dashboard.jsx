import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { UploadCloud, FileText, CheckCircle, AlertCircle, TrendingUp, LogOut } from 'lucide-react';

export default function Dashboard() {
    const [analyses, setAnalyses] = useState([]);
    const [file, setFile] = useState(null);
    const [jobDescription, setJobDescription] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [activeAnalysis, setActiveAnalysis] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchAnalyses();
    }, []);

    const fetchAnalyses = async () => {
        try {
            const { data } = await api.get('/analyze/');
            setAnalyses(data);
            if (data.length > 0) setActiveAnalysis(data[0]);
        } catch (error) {
            if (error.response?.status === 401) navigate('/login');
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        if (jobDescription) formData.append('job_description', jobDescription);

        try {
            const { data } = await api.post('/analyze/', formData);
            setAnalyses([data, ...analyses]);
            setActiveAnalysis(data);
            setFile(null);
            setJobDescription('');
        } catch (error) {
            alert(error.response?.data?.detail || 'Upload failed');
        } finally {
            setIsUploading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 relative bg-stark">
            {/* Sidebar */}
            <div className="lg:col-span-4 xl:col-span-3 border-r border-obsidian/10 bg-stark p-8 flex flex-col items-start h-screen sticky top-0 relative z-10 shadow-lg">
                <div className="w-full flex justify-between items-center mb-12">
                    <h2 className="font-heading text-2xl font-bold tracking-tight">Resu<span className="text-accent">.</span>AI</h2>
                    <button onClick={logout} className="p-2 hover:bg-obsidian/5 rounded-full transition-colors group">
                        <LogOut size={20} className="group-hover:text-accent transition-colors" />
                    </button>
                </div>

                <form onSubmit={handleUpload} className="w-full mb-12">
                    <h3 className="font-semibold text-xs uppercase tracking-widest mb-4 opacity-50">New Analysis</h3>
                    <div className="border border-obsidian/20 p-8 flex flex-col items-center justify-center bg-white cursor-pointer hover:border-obsidian hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all mb-4 group relative">
                        <input
                            type="file"
                            accept=".pdf,.docx"
                            onChange={(e) => setFile(e.target.files[0])}
                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                        />
                        <UploadCloud className="mb-4 text-obsidian/40 group-hover:text-accent transition-colors" size={36} />
                        <span className="text-sm font-medium text-center px-4 leading-tight">
                            {file ? file.name : 'Upload PDF or DOCX'}
                        </span>
                    </div>

                    <textarea
                        placeholder="Paste Job Description (Optional)"
                        className="input-field text-sm h-24 resize-none mb-6 border border-obsidian/10 p-3 bg-white focus:bg-white"
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                    />

                    <button type="submit" disabled={isUploading || !file} className="btn-primary w-full disabled:opacity-50">
                        {isUploading ? 'Processing...' : 'Analyze Document'}
                    </button>
                </form>

                <div className="w-full flex-grow overflow-y-auto pr-2 custom-scrollbar">
                    <h3 className="font-semibold text-xs uppercase tracking-widest mb-4 opacity-50">History</h3>
                    <div className="space-y-3">
                        {analyses.map(item => (
                            <div
                                key={item.id}
                                onClick={() => setActiveAnalysis(item)}
                                className={`p-4 border cursor-pointer transition-all ${activeAnalysis?.id === item.id ? 'border-obsidian bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : 'border-transparent hover:border-obsidian/20 bg-white/50'}`}
                            >
                                <div className="flex justify-between items-center mb-1">
                                    <span className="font-medium text-sm truncate max-w-[150px]">{item.filename}</span>
                                    <span className="text-lg font-heading font-bold">{Math.round(item.match_score)}</span>
                                </div>
                                <span className="text-xs opacity-50 font-medium">
                                    {new Date(item.created_at).toLocaleDateString()}
                                </span>
                            </div>
                        ))}
                        {analyses.length === 0 && (
                            <p className="text-sm opacity-50 italic">No past analyses.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-8 xl:col-span-9 p-8 lg:p-16 bg-white min-h-screen flex items-center justify-center">
                {!activeAnalysis ? (
                    <div className="flex flex-col items-center justify-center opacity-20 text-center">
                        <FileText size={100} className="mb-8" strokeWidth={1} />
                        <h2 className="heading-editorial text-5xl">Intelligence<br />Awaits</h2>
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={activeAnalysis.id}
                        className="w-full max-w-5xl self-start mt-8"
                    >
                        {/* Header section */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-20 border-b-2 border-obsidian pb-8">
                            <div>
                                <h1 className="heading-editorial mb-4">Diagnostic</h1>
                                <p className="text-lg opacity-60 font-medium tracking-wide">{activeAnalysis.filename}</p>
                            </div>
                            <div className="mt-8 md:mt-0 text-right">
                                <p className="text-xs uppercase tracking-widest font-bold opacity-50 mb-3">Match Score</p>
                                <div className="flex items-baseline gap-1">
                                    <span className={`text-7xl font-heading font-bold ${activeAnalysis.match_score >= 80 ? 'text-obsidian' : activeAnalysis.match_score >= 60 ? 'text-accent' : 'text-accent'}`}>
                                        {Math.round(activeAnalysis.match_score)}
                                    </span>
                                    <span className="text-2xl font-bold opacity-30">/100</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-20">
                            {/* Strengths */}
                            <div>
                                <div className="flex items-center gap-4 mb-8">
                                    <span className="p-3 bg-obsidian text-stark rounded-none">
                                        <CheckCircle size={24} />
                                    </span>
                                    <h3 className="text-2xl font-bold italic tracking-tight font-heading">Capabilities</h3>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {activeAnalysis.extracted_skills.map((skill, i) => (
                                        <span key={i} className="px-4 py-2 bg-white border border-obsidian text-sm font-semibold tracking-wide uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-px hover:translate-y-px hover:shadow-none transition-all">
                                            {skill}
                                        </span>
                                    ))}
                                    {activeAnalysis.extracted_skills.length === 0 && <span className="opacity-50 text-lg">None detected.</span>}
                                </div>
                            </div>

                            {/* Missing */}
                            <div>
                                <div className="flex items-center gap-4 mb-8">
                                    <span className="p-3 bg-accent text-stark rounded-none">
                                        <AlertCircle size={24} />
                                    </span>
                                    <h3 className="text-2xl font-bold italic tracking-tight font-heading">Deficiencies</h3>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {activeAnalysis.missing_skills.map((skill, i) => (
                                        <span key={i} className="px-4 py-2 bg-stark border border-accent/20 text-accent text-sm font-semibold tracking-wide uppercase">
                                            {skill}
                                        </span>
                                    ))}
                                    {activeAnalysis.missing_skills.length === 0 && <span className="opacity-50 text-lg">No significant gaps found.</span>}
                                </div>
                            </div>
                        </div>

                        {/* Suggestions */}
                        <div>
                            <div className="flex items-center gap-4 mb-10 pb-4 border-b border-obsidian/20">
                                <span className="p-3 bg-obsidian/5 border border-obsidian/10">
                                    <TrendingUp size={24} />
                                </span>
                                <h3 className="text-3xl font-bold font-heading">Strategic Prescriptions</h3>
                            </div>
                            <ul className="space-y-8">
                                {activeAnalysis.suggestions.map((suggestion, i) => (
                                    <li key={i} className="flex gap-6 group hover:bg-obsidian/5 p-6 -mx-6 transition-colors border-l-4 border-transparent hover:border-accent">
                                        <span className="font-heading text-3xl font-bold opacity-20 text-accent transition-opacity w-10 shrink-0">
                                            {String(i + 1).padStart(2, '0')}
                                        </span>
                                        <p className="text-xl leading-relaxed font-medium">{suggestion}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
