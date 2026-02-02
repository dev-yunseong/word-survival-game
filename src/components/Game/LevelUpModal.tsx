import React from 'react';
import { useGameStore, ALL_SKILLS } from '@/store/gameStore';
import type { Skill } from '@/store/gameStore';

interface LevelUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSkill: (skillId: string) => void;
}

const LevelUpModal: React.FC<LevelUpModalProps> = ({ isOpen, onClose, onSelectSkill }) => {
  const availableSkills = useGameStore((state) => state.availableSkills);
  const currentWave = useGameStore((state) => state.currentWave);

  // Determine which skills are available for selection based on wave or other criteria
  const skillsForSelection = ALL_SKILLS.filter(skill => 
    // Basic filtering: skills active in early waves
    // More complex logic could be added here based on player level, score, etc.
    skill.id !== 'chain_lightning' || currentWave >= 2 // Chain lightning available from wave 2
  ).filter(skill => !availableSkills.some(s => s.id === skill.id) && !useGameStore.getState().activeSkills.some(s => s.id === skill.id)); // Don't show skills already chosen or active

  const handleSelect = (skillId: string) => {
    onSelectSkill(skillId);
    onClose();
  };

  if (!isOpen || skillsForSelection.length === 0) {
    return null;
  }

  // Limit to 3 choices, shuffled and then picked (or pick first 3 unpicked)
  const choices = skillsForSelection.slice(0, 3); // Show first 3 available skills

  return (
    <div className="modal-overlay" style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    }}>
      <div className="modal-content" style={{
          backgroundColor: '#333',
          padding: '30px',
          borderRadius: '15px',
          color: 'white',
          textAlign: 'center',
          boxShadow: '0 0 25px rgba(0,0,0,0.6)',
          width: '80%',
          maxWidth: '500px',
      }}>
        <h2 style={{color: '#4CAF50', marginBottom: '20px', fontSize: '2em'}}>🎉 LEVEL UP! 🎉</h2>
        <p style={{marginBottom: '25px', fontSize: '1.1em'}}>새로운 스킬을 선택하세요:</p>
        <div style={{display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '20px'}}>
          {choices.map((skill) => (
            <div 
              key={skill.id} 
              className="skill-choice" 
              onClick={() => handleSelect(skill.id)}
              style={{
                backgroundColor: '#4CAF50',
                padding: '15px 20px',
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'background-color 0.3s ease, transform 0.2s ease',
                flex: '1 1 150px', // Flex properties for responsive choices
                minWidth: '150px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#45a049')}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#4CAF50')}
            >
              <span style={{fontSize: '2em', marginBottom: '10px'}}>{skill.icon || '✨'}</span>
              <h3 style={{margin: 0, marginBottom: '5px', fontSize: '1.3em'}}>{skill.name}</h3>
              <p style={{fontSize: '0.9em', margin: 0}}>{skill.description}</p>
            </div>
          ))}
        </div>
        <button onClick={onClose} style={{
            marginTop: '30px',
            padding: '10px 25px',
            fontSize: '1em',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'background-color 0.3s ease',
        }}
        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#e53935')}
        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#f44336')}
        >
          나중에 선택
        </button>
      </div>
    </div>
  );
};

export default LevelUpModal;
