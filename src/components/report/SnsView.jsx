import React from 'react';

const SnsView = ({ data }) => {
    return (
        <div className="space-y-12">
            {/* Instagram Section */}
            <section>
                <h3 className="font-serif text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <span className="text-2xl">📸</span> Instagram Feed
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {data.instagram.map((item) => (
                        <div key={item.id} className="bg-white border border-slate-200 rounded-lg overflow-hidden hover:-translate-y-1 hover:shadow-lg transition-all duration-200">
                            <div className="w-full aspect-square bg-gray-100 flex items-center justify-center text-gray-400">
                                {item.image ? <img src={item.image} alt="insta" className="w-full h-full object-cover"/> : "Image Placeholder"}
                            </div>
                            <div className="p-4">
                                <p className="font-semibold text-sm mb-2 whitespace-pre-wrap">{item.caption}</p>
                                <p className="text-xs text-slate-500 mb-3">{item.description}</p>
                                <div className="text-[10px] text-slate-400 mb-2">
                                    <p>📍 {item.location}</p>
                                    <p>📅 {item.date}</p>
                                </div>
                                <div className="text-xs text-blue-500 font-medium flex flex-wrap gap-1">
                                    {item.hashtags.map((tag, idx) => <span key={idx}>{tag}</span>)}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <hr className="border-t border-slate-200" />

            {/* X (Twitter) Section */}
            <section>
                <h3 className="font-serif text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <span className="text-2xl">🐦</span> X (Twitter)
                </h3>
                <div className="flex flex-col gap-4">
                    {data.x.map((item) => (
                        <div key={item.id} className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="font-bold text-sm mb-2">{item.author}</div>
                            <p className="text-sm text-slate-800 mb-3 leading-snug whitespace-pre-wrap">{item.text}</p>
                            {item.image && (
                                <div className="w-full h-48 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 text-xs overflow-hidden">
                                    <img src={item.image} alt="x post" className="w-full h-full object-cover"/>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            <hr className="border-t border-slate-200" />

            {/* Facebook Section */}
            <section>
                <h3 className="font-serif text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <span className="text-2xl">📘</span> Facebook
                </h3>
                <div className="flex flex-col gap-6">
                    {data.facebook.map((item) => (
                        <div key={item.id} className="bg-white border border-slate-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                            <div className="p-4 bg-slate-50 border-b border-slate-100 font-bold text-slate-900">
                                {item.title}
                            </div>
                            <div className="w-full h-64 bg-slate-200 flex items-center justify-center text-slate-400">
                                {item.image ? <img src={item.image} alt="facebook" className="w-full h-full object-cover"/> : "Image Placeholder"}
                            </div>
                            <div className="p-4">
                                <p className="text-sm text-slate-700 mb-2 whitespace-pre-wrap">{item.content}</p>
                                <a href={item.link} className="text-blue-600 text-sm hover:underline font-medium">Learn More</a>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default SnsView;