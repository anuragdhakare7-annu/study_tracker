import { useRef } from 'react'
import CourseForm from './CourseForm.jsx'
import Modal from './Modal.jsx'

export default function AddCourseModal({ onSubmit, onClose }) {
  const nameRef = useRef(null)

  return (
    <Modal
      title="Add subject"
      description="Add a subject and the number of lectures in its syllabus."
      onClose={onClose}
      initialFocusRef={nameRef}
    >
      <CourseForm
        initialValues={{ name: '', total: '', completed: '' }}
        submitLabel="Add subject"
        onSubmit={onSubmit}
        onCancel={onClose}
        nameInputRef={nameRef}
      />
    </Modal>
  )
}
