import React from 'react';

const SocialIcons = () => {
  const icons = [
    {
      name: 'Google',
      bg: 'bg-red-50',
      svg: (
        <svg viewBox="0 0 533.5 544.3" className="w-6 h-6">
          <path fill="#4285F4" d="M533.5 278.4c0-17.4-1.4-34-4-50.1H272v95h147.2c-6.3 34-25 62.7-53.4 82v68.2h86.5c50.6-46.6 81.2-115.3 81.2-195.1z" />
          <path fill="#34A853" d="M272 544.3c72.7 0 133.6-24 178.1-65.1l-86.5-68.2c-23.8 16-54.3 25.5-91.6 25.5-70.4 0-130-47.6-151.3-111.2H32.8v69.9C77 486 167.5 544.3 272 544.3z" />
          <path fill="#FBBC04" d="M120.7 325.2c-10-29.9-10-62.1 0-92L32.8 163.3C-10.9 250.3-10.9 364.1 32.8 451.1l87.9-69.9z" />
          <path fill="#EA4335" d="M272 107.7c39.6-.6 77.5 13.8 106.7 39.3l80-80.5C415 24.4 346.4-1 272 0 167.5 0 77 58.3 32.8 163.3l87.9 69.9C141.9 155.3 201.6 107.7 272 107.7z" />
        </svg>
      ),
    },
    {
      name: 'Facebook',
      bg: 'bg-blue-50',
      svg: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-blue-600">
          <path d="M22 12a10 10 0 1 0-11.6 9.9v-7h-2v-2.9h2V9.3c0-2 1.2-3.1 3-3.1.9 0 1.8.2 1.8.2v2h-1c-1 0-1.3.6-1.3 1.2v1.5h2.3L15.5 15h-2v7A10 10 0 0 0 22 12z" />
        </svg>
      ),
    },
    {
      name: 'Twitter',
      bg: 'bg-sky-50',
      svg: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-sky-500">
          <path d="M22.46 6c-.77.35-1.6.59-2.46.7a4.3 4.3 0 0 0 1.88-2.38 8.56 8.56 0 0 1-2.7 1.03 4.28 4.28 0 0 0-7.3 3.9A12.14 12.14 0 0 1 3.15 4.9a4.26 4.26 0 0 0 1.32 5.7 4.22 4.22 0 0 1-1.94-.54v.06a4.28 4.28 0 0 0 3.44 4.2 4.3 4.3 0 0 1-1.93.07 4.29 4.29 0 0 0 4 3 8.6 8.6 0 0 1-5.33 1.84c-.35 0-.7-.02-1.04-.06a12.14 12.14 0 0 0 6.56 1.93c7.88 0 12.2-6.53 12.2-12.2 0-.19 0-.38-.01-.57A8.74 8.74 0 0 0 24 4.56a8.5 8.5 0 0 1-2.54.7z" />
        </svg>
      ),
    },
    {
      name: 'GitHub',
      bg: 'bg-slate-50',
      svg: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-slate-800">
          <path fillRule="evenodd" clipRule="evenodd" d="M12 .5A11.5 11.5 0 0 0 .5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.2.8-.6v-2c-3.2.7-3.9-1.5-3.9-1.5a3 3 0 0 0-1.3-1.7c-1-.7.1-.7.1-.7a2.5 2.5 0 0 1 1.8 1.2 2.5 2.5 0 0 0 3.4 1 2.5 2.5 0 0 1 .7-1.6c-2.6-.3-5.3-1.3-5.3-5.7a4.5 4.5 0 0 1 1.2-3.2 4.2 4.2 0 0 1 .1-3.2s1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.4 1 .4 2.2.1 3.2a4.5 4.5 0 0 1 1.2 3.2c0 4.5-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.3v3.4c0 .4.3.7.8.6A11.5 11.5 0 0 0 23.5 12 11.5 11.5 0 0 0 12 .5z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex gap-4 w-full justify-center my-3">
      {icons.map((icon) => (
        <div
          key={icon.name}
          className={`w-14 h-14 ${icon.bg} flex items-center justify-center rounded-xl shadow-sm cursor-pointer`}
          title={icon.name}
        >
          {icon.svg}
        </div>
      ))}
    </div>
  );
};

export default SocialIcons;
