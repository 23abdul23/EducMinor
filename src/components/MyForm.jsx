import { useState } from 'react'

const MyForm = () => {
  const [formState, setFormState] = useState({ field: '' })

  const handleChange = (event) => {
    setFormState({ field: event.target.value })
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    console.info('Form submission placeholder', formState)
  }

  return (
    <form className="section-placeholder" onSubmit={handleSubmit}>
      <label htmlFor="minor-form-field">Sample Field</label>
      <input id="minor-form-field" value={formState.field} onChange={handleChange} />
      <button type="submit">Submit</button>
    </form>
  )
}

export default MyForm
