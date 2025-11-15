import CertificateCard from '../components/CertificateCard'
import EditableText from '../components/Editable_text'
import MyForm from '../components/MyForm'
import Nav from '../components/Nav'
import Nav2 from '../components/Nav2'

const AdminDashboard = () => (
  <div className="app-shell min-h-screen bg-slate-50">
    <Nav />
    <Nav2 />
    <main className="px-6 py-8 grid gap-6">
      <section className="section-placeholder space-y-2">
        <h2>Admin Overview</h2>
        <p>Use this area to surface stats once data is available.</p>
      </section>

      <section className="section-placeholder grid gap-4">
        <h3>Certificate Template Preview</h3>
        <CertificateCard />
      </section>

      <section className="section-placeholder space-y-3">
        <h3>Announcements</h3>
        <EditableText />
      </section>

      <section className="section-placeholder space-y-3">
        <h3>Issue Certificate</h3>
        <MyForm />
      </section>
    </main>
  </div>
)

export default AdminDashboard
