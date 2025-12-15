
import React, { useEffect, useState } from 'react';
import { User, Subject, Grade } from '../../types';
import { getSubjectsByTeacher, getGradesBySubject, getStudentsByClass, updateGrade, createClassAssignment } from '../../services/mockBackend';

interface GradeEncodingProps {
  user: User;
}

const GradeEncoding: React.FC<GradeEncodingProps> = ({ user }) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [term, setTerm] = useState('Midterm'); 
  const [students, setStudents] = useState<User[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(false);

  // New Assignment State
  const [showAddAssessment, setShowAddAssessment] = useState(false);
  const [newAssessmentName, setNewAssessmentName] = useState('');
  const [newMaxScore, setNewMaxScore] = useState(100);

  useEffect(() => {
    const init = async () => {
      const subs = await getSubjectsByTeacher(user.id);
      setSubjects(subs);
      if (subs.length > 0) setSelectedSubjectId(subs[0].id);
    };
    init();
  }, [user.id]);

  useEffect(() => {
    const loadClassData = async () => {
      if (!selectedSubjectId) return;
      setLoading(true);
      const classList = await getStudentsByClass(user.id, selectedSubjectId);
      const uniqueStudents = Array.from(new Set(classList.map(c => c.student)));
      setStudents(uniqueStudents);
      const classGrades = await getGradesBySubject(selectedSubjectId);
      setGrades(classGrades);
      setLoading(false);
    };
    loadClassData();
  }, [selectedSubjectId, user.id]);

  const handleSaveGrade = async (gradeId: string, studentId: string, newScore: number) => {
    try {
        await updateGrade(gradeId, newScore, user.id, studentId, selectedSubjectId, term);
        const updatedGrades = await getGradesBySubject(selectedSubjectId);
        setGrades(updatedGrades);
    } catch (error) {
        alert("Failed to update grade");
    }
  };

  const handleCreateAssignment = async () => {
    if (!newAssessmentName) {
        alert("Please enter an assignment name");
        return;
    }
    await createClassAssignment(user.id, selectedSubjectId, term, newAssessmentName, newMaxScore);
    setShowAddAssessment(false);
    setNewAssessmentName('');
    // Refresh
    const classGrades = await getGradesBySubject(selectedSubjectId);
    setGrades(classGrades);
    alert("Assignment created for all students!");
  };

  // Helper to find specific grade entry. 
  // IMPORTANT: Since we now have "Assignments" which share terms, we need to filter by name or fallback to term defaults.
  // For simplicity in this list view, we will just show one column for "Current Term Grade" (mock logic) 
  // OR we iterate through known assessments.
  // Let's list students and allow editing the grade for the *currently selected term*.
  // If multiple assessments exist for a term, the UI here simplifies to just one "Term Grade" unless we expand to a full Gradebook grid.
  // To keep it clean: We will assume "Midterm" and "Final" are standard entries, plus any extra assignments.
  
  // Let's filter grades by the selected Term.
  const termGrades = grades.filter(g => g.term === term);

  const getGradeForStudentAndAssessment = (studentId: string, assessmentName?: string) => {
      return termGrades.find(g => g.studentId === studentId && g.assessmentName === assessmentName) || { id: '', score: 0, term: term };
  };

  // Identify unique assessments in this term
  const assessments = Array.from(new Set(termGrades.map(g => g.assessmentName || 'Standard Grade')));

  const inputClass = "w-full px-4 py-2 border border-blue-200 rounded-lg bg-blue-50 text-blue-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white";

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
         <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Grade Encoding</h2>
         <button 
           onClick={() => setShowAddAssessment(true)}
           className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition shadow"
         >
           + New Assignment
         </button>
      </div>
      
      {/* Create Assignment Modal */}
      {showAddAssessment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
           <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-sm shadow-xl">
              <h3 className="text-lg font-bold mb-4 dark:text-white">Create New Assignment</h3>
              <div className="space-y-4">
                 <div>
                    <label className="block text-sm mb-1 dark:text-gray-300">Name (e.g., Quiz 1)</label>
                    <input 
                      value={newAssessmentName}
                      onChange={e => setNewAssessmentName(e.target.value)}
                      className={inputClass}
                    />
                 </div>
                 <div>
                    <label className="block text-sm mb-1 dark:text-gray-300">Max Score</label>
                    <input 
                      type="number"
                      value={newMaxScore}
                      onChange={e => setNewMaxScore(Number(e.target.value))}
                      className={inputClass}
                    />
                 </div>
                 <div className="flex justify-end gap-2 pt-2">
                    <button onClick={() => setShowAddAssessment(false)} className="px-4 py-2 text-gray-500">Cancel</button>
                    <button onClick={handleCreateAssignment} className="px-4 py-2 bg-blue-600 text-white rounded">Create</button>
                 </div>
              </div>
           </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Subject</label>
            <select 
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className={inputClass}
            >
            {subjects.map(sub => (
                <option key={sub.id} value={sub.id}>{sub.code} - {sub.name}</option>
            ))}
            </select>
        </div>
        <div className="w-full md:w-1/3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Grading Term</label>
            <select 
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              className={inputClass}
            >
                <option value="Midterm">Midterm</option>
                <option value="Final">Final</option>
            </select>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading class data...</div>
        ) : (
          <table className="w-full text-left text-sm min-w-[600px]">
            <thead className="bg-gray-50 dark:bg-gray-750 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300 sticky left-0 bg-gray-50 dark:bg-gray-750">Student</th>
                {assessments.length === 0 ? (
                    <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300">Standard Grade</th>
                ) : assessments.map((a, i) => (
                    <th key={i} className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300">{a}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {students.map(student => (
                  <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                      <td className="px-6 py-4 font-medium dark:text-white sticky left-0 bg-white dark:bg-gray-800">{student.fullName}</td>
                      
                      {assessments.length === 0 ? (
                          // Fallback if no assessments created yet
                          <GradeCell 
                            studentId={student.id} 
                            grade={getGradeForStudentAndAssessment(student.id, undefined) as Grade}
                            onSave={(val) => handleSaveGrade(getGradeForStudentAndAssessment(student.id, undefined).id, student.id, val)}
                          />
                      ) : (
                          assessments.map((assName, idx) => {
                             const actualName = assName === 'Standard Grade' ? undefined : assName;
                             const gradeInfo = getGradeForStudentAndAssessment(student.id, actualName);
                             return (
                                <GradeCell 
                                   key={idx}
                                   studentId={student.id} 
                                   grade={gradeInfo as Grade}
                                   onSave={(val) => handleSaveGrade(gradeInfo.id, student.id, val)}
                                />
                             );
                          })
                      )}
                  </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

const GradeCell: React.FC<{ studentId: string; grade: Grade; onSave: (val: number) => void }> = ({ grade, onSave }) => {
  const [score, setScore] = useState(grade.score || 0);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => { setScore(grade.score || 0); setIsDirty(false); }, [grade.score]);

  return (
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
            <input 
            type="number" min="0" max="100" value={score}
            onChange={(e) => { setScore(Number(e.target.value)); setIsDirty(true); }}
            className="w-20 px-3 py-1 border border-blue-200 rounded bg-blue-50 text-blue-900 focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none"
            />
            {isDirty && (
                <button onClick={() => {onSave(Number(score)); setIsDirty(false);}} className="text-blue-600 text-xs font-bold hover:underline">
                    Save
                </button>
            )}
        </div>
      </td>
  );
}

export default GradeEncoding;
