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
      name: 'Calm',
      description: 'A state of peace, tranquility, and freedom from agitation.',
      color: 'bg-green-300',
      icon: 'M5 13l4 4L19 7',
      scenarios: {
        self: {
          title: "I'm feeling Calm",
          immediate: ['Notice and appreciate the feeling.', 'Take a few mindful breaths.', 'Look around and notice the details of your environment.'],
          shortTerm: ['Engage in a relaxing hobby like reading or listening to music.', 'Spend time in a quiet, natural setting.', 'Jot down thoughts in a journal.'],
          longTerm: ['Identify what helps you feel calm and incorporate it into your routine.', 'Practice regular mindfulness or meditation.', 'Design a living space that promotes peace.'],
        },
        friend: {
          title: 'My friend is feeling Calm',
          immediate: ['Enjoy the peaceful moment with them.', 'Share in the quiet comfort.', 'Keep the environment peaceful.'],
          shortTerm: ['Engage in a calm activity together.', 'Have a gentle, meaningful conversation.', 'Respect their need for peace.'],
          longTerm: ['Be a source of stability and calm in their life.', 'Encourage their healthy, calming habits.', 'Plan relaxing outings together.'],
        },
        caused: {
          title: 'I helped someone feel Calm',
          immediate: ['Be proud of your positive influence.', 'Acknowledge the peaceful state without disrupting it.', 'Continue your calming behavior.'],
          shortTerm: ['Reflect on what you did to help.', 'Understand that you can be a comforting presence.', 'Offer support without being intrusive.'],
          longTerm: ['Cultivate your own sense of inner peace.', 'Practice active listening and empathy.', 'Be a reliable and safe person for others.'],
        },
      },
    },
    {
      name: 'Love',
      description: 'A feeling of deep affection, care, and connection.',
      color: 'bg-pink-400',
      icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
      scenarios: {
        self: {
          title: "I'm feeling Love",
          immediate: ['Express it to the person you love.', 'Savor the warmth and connection.', 'Do something kind for them.'],
          shortTerm: ['Spend quality time with your loved ones.', 'Write a letter expressing your feelings.', 'Plan a special shared experience.'],
          longTerm: ['Nurture your relationships consistently.', 'Practice acts of service and kindness.', 'Learn your loved ones\' "love languages."'],
        },
        friend: {
          title: 'My friend is feeling Love',
          immediate: ['Be happy for them!', 'Listen as they talk about their feelings.', 'Ask about the person they love.'],
          shortTerm: ['Be a supportive friend, especially in new relationships.', 'Give them space to nurture their relationship.', 'Include their partner in activities.'],
          longTerm: ['Be a constant source of support through ups and downs.', 'Remind them of their worth.', 'Celebrate their relationship milestones.'],
        },
        caused: {
          title: 'I caused someone to feel Loved',
          immediate: ['Accept their affection graciously.', 'Reciprocate the feeling if you share it.', 'Acknowledge their expression of care.'],
          shortTerm: ['Continue the behaviors that make them feel loved.', 'Communicate openly about your feelings.', 'Be consistent and trustworthy.'],
          longTerm: ['Invest time and energy in the relationship.', 'Build a foundation of mutual respect and trust.', 'Cherish the connection you share.'],
        },
      },
    },
    {
      name: 'Shame',
      description: 'A painful feeling of humiliation or distress caused by the consciousness of wrong or foolish behavior.',
      color: 'bg-gray-400',
      icon: 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636',
      scenarios: {
        self: {
          title: "I'm feeling Shame",
          immediate: ['Remind yourself: "This is a feeling, not a fact about who I am."', 'Breathe deeply to calm your nervous system.', 'Name the feeling: "I am experiencing shame."'],
          shortTerm: ['Talk to one trusted person who will respond with empathy.', 'Separate the action from your identity: "I did a bad thing" vs. "I am bad."', 'Practice a self-compassion exercise.'],
          longTerm: ['Explore the root of your shame, possibly with a therapist.', 'Practice vulnerability with safe people.', 'Work on self-forgiveness and making amends if necessary.'],
        },
        friend: {
          title: 'My friend is feeling Shame',
          immediate: ['Listen without judgment.', 'Say "That sounds incredibly painful" or "Thank you for trusting me with this."', 'Remind them they are not alone.'],
          shortTerm: ['Share a story of your own imperfection.', 'Reassure them that one action doesn\'t define them.', 'Don\'t try to "fix it," just be present.'],
          longTerm: ['Encourage them to practice self-compassion.', 'Gently challenge their negative self-talk.', 'Continue to show them they are worthy of connection.'],
        },
        caused: {
          title: 'I caused someone Shame (Shaming)',
          immediate: ['Recognize your impact immediately.', 'Stop the behavior and apologize sincerely.', '"What I said/did was not okay, and I\'m sorry I hurt you."'],
          shortTerm: ['Reflect on why you resorted to shaming.', 'Educate yourself on constructive communication.', 'Give the person space and respect their boundaries.'],
          longTerm: ['Commit to never using shame as a tool.', 'Practice empathy and perspective-taking.', 'Work to rebuild safety and trust in the relationship.'],
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
