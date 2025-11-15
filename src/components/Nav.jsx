const Nav = () => {
  return (
    <div className="flex justify-between items-center px-6 py-4 bg-white/80 backdrop-blur border-b border-gray-200 shadow-sm">
      <div className="text-xl font-semibold text-slate-800">Minor2</div>
      <div className="flex gap-4 text-sm text-slate-600">
        <span className="hover:text-slate-900 cursor-pointer">Home</span>
        <span className="hover:text-slate-900 cursor-pointer">Certificates</span>
        <span className="hover:text-slate-900 cursor-pointer">Issue</span>
        <span className="hover:text-slate-900 cursor-pointer">Recruiter</span>
        <span className="hover:text-slate-900 cursor-pointer">Interviewer</span>
      </div>
    </div>
  )
}

export default Nav
