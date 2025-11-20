import { Injectable } from '@angular/core';
import { Emotion } from './models';

@Injectable({ providedIn: 'root' })
export class EmotionService {
  private emotions: Emotion[] = [
    {
      name: 'Joy',
      description: 'A feeling of great pleasure and happiness.',
      color: 'bg-yellow-300',
      icon: 'M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      scenarios: {
        self: {
          title: "I'm feeling Joyful",
          immediate: ['Share your feeling with someone.', 'Smile and savor the moment.', 'Listen to uplifting music.'],
          shortTerm: ['Write down what you\'re grateful for.', 'Do something you love.', 'Plan a fun activity.'],
          longTerm: ['Cultivate hobbies that bring you joy.', 'Practice gratitude regularly.', 'Build strong, positive relationships.'],
        },
        friend: {
          title: 'My friend is feeling Joyful',
          immediate: ['Celebrate with them!', 'Tell them you\'re happy for them.', 'Listen to them share their good news.'],
          shortTerm: ['Offer to join them in a celebratory activity.', 'Ask them about their experience.', 'Share in their happiness without making it about you.'],
          longTerm: ['Be a consistently supportive friend.', 'Remember what brings them joy and encourage it.', 'Create shared positive memories.'],
        },
        caused: {
          title: 'I caused someone Joy',
          immediate: ['Enjoy the moment with them.', 'Acknowledge their happiness.', 'Accept their thanks gracefully.'],
          shortTerm: ['Reflect on the positive action you took.', 'Let it reinforce your positive behavior.', 'Continue being a positive force.'],
          longTerm: ['Understand what makes people happy.', 'Incorporate kindness into your daily life.', 'Value the positive impact you can have on others.'],
        },
      },
    },
    {
      name: 'Sadness',
      description: 'A feeling of sorrow, unhappiness, or grief.',
      color: 'bg-blue-400',
      icon: 'M10 14h4m-2 4a8 8 0 100-16 8 8 0 000 16z',
      oppositeAction: {
        suggestion: 'Get active or engage with your surroundings.',
        rationale: 'Sadness often makes us withdraw. Gently engaging with the world, like going for a walk or tidying a room, can counteract this inertia and lift your mood.'
      },
      scenarios: {
        self: {
          title: "I'm feeling Sad",
          immediate: ['Allow yourself to cry if you need to.', 'Wrap yourself in a warm blanket.', 'Drink a warm, comforting beverage.'],
          shortTerm: ['Talk to a trusted friend or family member.', 'Watch a comforting movie or show.', 'Go for a gentle walk in nature.'],
          longTerm: ['Seek professional help if sadness persists.', 'Practice self-compassion.', 'Connect with a support group.'],
        },
        friend: {
          title: 'My friend is feeling Sad',
          immediate: ['Just be there and listen.', 'Offer a hug if appropriate.', 'Say "It\'s okay to be sad."'],
          shortTerm: ['Check in on them regularly.', 'Help with practical tasks like cooking or cleaning.', 'Invite them for a low-key activity.'],
          longTerm: ['Encourage them to seek help if needed.', 'Be patient with their healing process.', 'Remind them you care.'],
        },
        caused: {
          title: 'I caused someone Sadness',
          immediate: ['Apologize sincerely and specifically.', 'Listen to their perspective without getting defensive.', 'Acknowledge their pain: "I understand why you\'re hurt."'],
          shortTerm: ['Give them space, but let them know you\'re there.', 'Ask how you can make things right.', 'Reflect on your actions.'],
          longTerm: ['Learn from the mistake.', 'Work on rebuilding trust through consistent, positive actions.', 'Practice better communication.'],
        },
      },
    },
    {
      name: 'Anger',
      description: 'A strong feeling of annoyance, displeasure, or hostility.',
      color: 'bg-red-500',
      icon: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      oppositeAction: {
        suggestion: 'Gently wash your face with cool water or offer a kind gesture.',
        rationale: 'Anger is a "hot" emotion. The physical sensation of cool water can be physiologically calming. A kind gesture is behaviorally opposite to aggression.'
      },
      scenarios: {
        self: {
          title: "I'm feeling Angry",
          immediate: ['Take 10 deep, slow breaths.', 'Count to 20 before reacting.', 'Leave the situation for a few minutes.'],
          shortTerm: ['Engage in physical activity like running or punching a pillow.', 'Write down your feelings in a journal.', 'Listen to intense music.'],
          longTerm: ['Identify your anger triggers.', 'Learn healthy communication skills.', 'Practice relaxation techniques like meditation.'],
        },
        friend: {
          title: 'My friend is feeling Angry',
          immediate: ['Stay calm.', 'Listen without judging or interrupting.', 'Validate their feelings: "I can see why you\'re so angry."'],
          shortTerm: ['Give them space to cool down.', 'Suggest a physical activity to burn off steam.', 'Avoid telling them to "calm down."'],
          longTerm: ['Help them identify the root of their anger.', 'Encourage constructive ways to express their feelings.', 'Be a reliable, calm presence.'],
        },
        caused: {
          title: 'I caused someone Anger',
          immediate: ['Give them space.', 'Listen to understand, not to reply.', 'Acknowledge their feelings without making excuses.'],
          shortTerm: ['Apologize for your role in the situation.', 'Offer to discuss the issue when you are both calm.', 'Focus on finding a solution, not winning.'],
          longTerm: ['Reflect on your behavior and its impact.', 'Commit to changing the behavior that caused the anger.', 'Work on communication and empathy.'],
        },
      },
    },
    {
      name: 'Fear',
      description: 'An unpleasant emotion caused by the belief that someone or something is dangerous, likely to cause pain, or a threat.',
      color: 'bg-purple-400',
      icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
      oppositeAction: {
        suggestion: 'Approach one small, safe part of what you fear.',
        rationale: 'Fear urges you to avoid. By taking a tiny, manageable step towards the feared situation, you teach your brain that you can cope and build confidence.'
      },
      scenarios: {
        self: {
          title: "I'm feeling Fearful",
          immediate: ['Focus on your breathing; inhale for 4, hold for 4, exhale for 6.', 'Ground yourself: name 5 things you see, 4 you feel, 3 you hear.', 'Hold a piece of ice.'],
          shortTerm: ['Talk about your fear with someone you trust.', 'Write down what you are afraid of and why.', 'Do something that makes you feel safe and comfortable.'],
          longTerm: ['Break down the fear into smaller, manageable steps.', 'Gradually expose yourself to what you fear in a safe way.', 'Consider therapy (like CBT) for persistent fears.'],
        },
        friend: {
          title: 'My friend is feeling Fearful',
          immediate: ['Speak in a calm, reassuring voice.', 'Remind them they are safe with you.', 'Ask what would help them feel safer right now.'],
          shortTerm: ['Don\'t dismiss their fears.', 'Help them think through the fear logically, but only if they are ready.', 'Distract them with a pleasant activity.'],
          longTerm: ['Support them in facing their fears at their own pace.', 'Celebrate small victories with them.', 'Encourage them to seek professional help if it\'s debilitating.'],
        },
        caused: {
          title: 'I caused someone Fear',
          immediate: ['Stop the action causing the fear immediately.', 'Give them physical space.', 'Apologize for making them feel unsafe.'],
          shortTerm: ['Reassure them of your intentions (if they were good).', 'Ask what you can do to restore their sense of safety.', 'Listen to their experience without justification.'],
          longTerm: ['Understand what you did to cause fear.', 'Commit to creating a safe environment.', 'Be patient, as trust and safety take time to rebuild.'],
        },
      },
    },
    {
      name: 'Surprise',
      description: 'The feeling of astonishment or amazement caused by something unexpected.',
      color: 'bg-teal-300',
      icon: 'M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z',
      scenarios: {
        self: {
          title: "I'm feeling Surprised",
          immediate: ['Take a moment to process the new information.', 'Breathe and allow the feeling to settle.', 'Identify if the surprise is pleasant, unpleasant, or neutral.'],
          shortTerm: ['Talk about the surprising event with someone.', 'Journal about your reaction.', 'Adjust your plans or understanding based on the new reality.'],
          longTerm: ['Reflect on how you react to the unexpected.', 'Cultivate mental flexibility and adaptability.', 'Learn from the experience.'],
        },
        friend: {
          title: 'My friend is feeling Surprised',
          immediate: ['Give them a moment to react.', 'Ask "How are you feeling about this?"', 'Mirror their energy (e.g., be excited for good news).'],
          shortTerm: ['Help them process the information.', 'Offer practical support if the surprise requires action.', 'Be a sounding board for their thoughts.'],
          longTerm: ['Help them adapt to the new situation.', 'Check in later to see how they are doing.', 'Be a stable presence in their life.'],
        },
        caused: {
          title: 'I caused someone Surprise',
          immediate: ['Observe their reaction to gauge the nature of the surprise.', 'Explain your reasoning if necessary.', 'Give them time and space to process.'],
          shortTerm: ['Answer any questions they might have.', 'Apologize if it was an unpleasant surprise you could have handled better.', 'Share in their joy if it was a happy surprise.'],
          longTerm: ['Consider how to deliver unexpected news in the future.', 'Build a reputation for clear communication.', 'Enjoy the fun of positive surprises.'],
        },
      },
    },
    {
      name: 'Anticipation',
      description: 'A feeling of excitement or anxiety about something that is going to happen.',
      color: 'bg-orange-300',
      icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
      scenarios: {
        self: {
          title: "I'm feeling Anticipation",
          immediate: ['Acknowledge the feeling.', 'Take a few deep breaths to manage excitement or anxiety.', 'Focus on the present moment for a bit.'],
          shortTerm: ['Prepare for the event if possible.', 'Talk about your feelings with someone.', 'Distract yourself with a pleasant activity if the anticipation is overwhelming.'],
          longTerm: ['Practice mindfulness to manage future-oriented thoughts.', 'Learn to differentiate between excited and anxious anticipation.', 'Set realistic expectations for future events.'],
        },
        friend: {
          title: 'My friend is feeling Anticipation',
          immediate: ['Share in their excitement.', 'Listen to them talk about what they\'re anticipating.', 'Ask them how they feel about it.'],
          shortTerm: ['Help them prepare if they need it.', 'Offer to be there for the event.', 'Distract them if they seem anxious.'],
          longTerm: ['Be a supportive presence for their goals.', 'Celebrate their successes with them.', 'Help them manage disappointment if things don\'t go as planned.'],
        },
        caused: {
          title: 'I caused someone Anticipation',
          immediate: ['Enjoy their excitement if it\'s positive.', 'Clarify expectations if needed.', 'Be mindful of their feelings.'],
          shortTerm: ['Follow through on your promises.', 'Communicate clearly about upcoming plans.', 'Share information to reduce their anxiety.'],
          longTerm: ['Be reliable and trustworthy.', 'Build a reputation for creating positive experiences.', 'Learn how to manage others\' expectations effectively.'],
        },
      },
    },
    {
      name: 'Disgust',
      description: 'A feeling of revulsion or strong disapproval aroused by something unpleasant or offensive.',
      color: 'bg-emerald-700',
      icon: 'M12 2a10 10 0 100 20 10 10 0 000-20zM9 10h.01M15 10h.01M8 14s1.5 2 4 2 4-2 4-2',
      scenarios: {
        self: {
          title: "I'm feeling Disgusted",
          immediate: ['Physically move away from the source of disgust.', 'Take a deep breath of fresh air.', 'Focus on a neutral or pleasant sensation.'],
          shortTerm: ['Wash your hands or take a shower to feel clean.', 'Talk about what disgusted you with someone.', 'Engage in an activity that you find pleasant and clean.'],
          longTerm: ['Identify your triggers for disgust.', 'If disgust is moral, reflect on your values.', 'Learn to set boundaries to avoid situations that cause disgust.'],
        },
        friend: {
          title: 'My friend is feeling Disgusted',
          immediate: ['Validate their feeling: "That does sound disgusting."', 'Help them move away from the source.', 'Offer them a tissue or a drink of water.'],
          shortTerm: ['Listen to them vent about it.', 'Don\'t minimize their feeling.', 'Help them distract themselves with something pleasant.'],
          longTerm: ['Support them in setting boundaries.', 'Understand their sensitivities.', 'Help them process moral disgust if it\'s related to an injustice.']
        },
        caused: {
          title: 'I caused someone Disgust',
          immediate: ['Stop the behavior immediately.', 'Apologize sincerely.', 'Give them space.'],
          shortTerm: ['Listen to understand why they were disgusted.', 'Don\'t be defensive; acknowledge their reaction.', 'Ask what you can do to make it right.'],
          longTerm: ['Reflect on your actions and their impact.', 'Learn from the experience to be more considerate.', 'Work on rebuilding trust by being respectful of their boundaries.'],
        },
      },
    },
    {
      name: 'Trust',
      description: 'A firm belief in the reliability, truth, ability, or strength of someone or something.',
      color: 'bg-sky-500',
      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      scenarios: {
        self: {
          title: "I'm feeling Trust",
          immediate: ['Acknowledge and appreciate the feeling of safety.', 'Lean into the feeling.', 'Express your trust to the person if appropriate.'],
          shortTerm: ['Strengthen the bond by reciprocating trust.', 'Collaborate on something together.', 'Enjoy the sense of connection and security.'],
          longTerm: ['Nurture the relationships where you feel trust.', 'Be a trustworthy person yourself.', 'Understand that trust is built over time through consistent actions.'],
        },
        friend: {
          title: 'My friend is feeling Trust',
          immediate: ['Be honored they trust you.', 'Listen attentively.', 'Reassure them their trust is well-placed.'],
          shortTerm: ['Keep their confidences.', 'Be reliable and follow through on promises.', 'Show you value their trust in you.'],
          longTerm: ['Be a consistently dependable friend.', 'Communicate openly and honestly.', 'Support them and have their back.'],
        },
        caused: {
          title: 'I caused someone to feel Trust',
          immediate: ['Acknowledge their trust with gratitude.', 'Feel good about being a reliable person.', 'Continue being dependable.'],
          shortTerm: ['Live up to the trust they\'ve placed in you.', 'Don\'t take it for granted.', 'Maintain open and honest communication.'],
          longTerm: ['Consistently act with integrity.', 'Build a strong foundation for the relationship.', 'Cherish the role you play in making someone feel safe.'],
        },
      },
    },
  ];

  getEmotions(): Emotion[] {
    return this.emotions;
  }

  getEmotionByName(name: string): Emotion | undefined {
    return this.emotions.find(e => e.name === name);
  }
}