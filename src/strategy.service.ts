

import { Injectable, signal, effect, inject, WritableSignal } from '@angular/core';
import { Strategy, Step, UserEmotionStrategies } from './models';
import { EmotionService } from './emotion.service';

@Injectable({ providedIn: 'root' })
export class StrategyService {
    private emotionService = inject(EmotionService);
    private readonly storageKey = 'feel-better-strategies';

    private strategyDetailsMap = new Map<string, { title: string; steps: string[]; toolId?: 'grounding' }>([
        // --- Joy ---
        // Self
        ['Share your feeling with someone.', { title: 'Share Your Joy', steps: ['Think of someone who will be happy for you.', 'Reach out via text, call, or in person.', 'Share what happened and how you feel.'] }],
        ['Smile and savor the moment.', { title: 'Savor the Moment', steps: ['Find a quiet spot for one minute.', 'Close your eyes and focus on the physical feeling of joy.', 'Smile gently.', 'Mentally note the details of what is making you happy.'] }],
        ['Listen to uplifting music.', { title: 'Uplifting Music', steps: ['Pick a song you associate with happy memories.', 'Put on headphones to fully immerse yourself.', 'Allow yourself to move: tap your feet, nod, or dance.'] }],
        ['Write down what you\'re grateful for.', { title: 'Gratitude Journaling', steps: ['Open a notebook or notes app.', 'List 3-5 specific things you are grateful for right now.', 'For each item, write why it\'s meaningful to you.'] }],
        ['Do something you love.', { title: 'Engage in a Hobby', steps: ['Choose an activity you genuinely enjoy, not one you *should* do.', 'Set aside at least 15-30 minutes for it.', 'Immerse yourself fully, putting away distractions.'] }],
        ['Plan a fun activity.', { title: 'Plan Something Fun', steps: ['Think of an activity you\'d look forward to.', 'It could be small (a movie night) or big (a day trip).', 'Put it on your calendar to give you something to anticipate.'] }],
        ['Cultivate hobbies that bring you joy.', { title: 'Cultivate Hobbies', steps: ['Explore new interests you\'ve been curious about.', 'Schedule regular time for your hobbies each week.', 'Focus on the process, not just the outcome.'] }],
        ['Practice gratitude regularly.', { title: 'Regular Gratitude', steps: ['Set a daily or weekly time to reflect.', 'Think of three new things you\'re grateful for.', 'Write them down to make them more concrete.'] }],
        ['Build strong, positive relationships.', { title: 'Nurture Relationships', steps: ['Identify people who lift you up.', 'Schedule regular time to connect with them.', 'Practice active listening and offer genuine support.'] }],
        // Friend
        ['Celebrate with them!', { title: 'Celebrate Together', steps: ['Show genuine excitement and enthusiasm.', 'Ask, "How should we celebrate?" to involve them.', 'A simple high-five, cheer, or "That\'s amazing!" can go a long way.'] }],
        ['Tell them you\'re happy for them.', { title: 'Express Your Happiness', steps: ['Be direct: "I am so happy for you!"', 'Mention a specific reason why you\'re happy for them.', 'Make eye contact and smile to show sincerity.'] }],
        ['Listen to them share their good news.', { title: 'Listen Actively', steps: ['Put away your phone and give them your full attention.', 'Ask open-ended questions like, "How did that feel?"', 'Let them have the spotlight; resist sharing your own news.'] }],
        ['Offer to join them in a celebratory activity.', { title: 'Join the Celebration', steps: ['Suggest a simple activity: "Can I treat you to a coffee to celebrate?"', 'Let them choose the activity if they prefer.', 'Focus on sharing the positive moment with them.'] }],
        ['Ask them about their experience.', { title: 'Ask About the Experience', steps: ['Go beyond the surface: "What was the best part of it for you?"', 'Show curiosity about their journey and feelings.', 'Listen to the story behind their success.'] }],
        ['Share in their happiness without making it about you.', { title: 'Keep the Focus on Them', steps: ['Resist the urge to one-up their story or relate it back to yourself.', 'Your role is to be a supportive audience.', 'Celebrate their win as their own.'] }],
        ['Be a consistently supportive friend.', { title: 'Be Consistent', steps: ['Check in on their goals and progress.', 'Be there for small moments, not just big announcements.', 'Your reliability builds a strong foundation.'] }],
        ['Remember what brings them joy and encourage it.', { title: 'Encourage Their Passions', steps: ['Pay attention to what makes their eyes light up.', 'Send them things related to their interests.', 'Encourage them to make time for their hobbies.'] }],
        ['Create shared positive memories.', { title: 'Make Memories', steps: ['Plan low-pressure, fun activities together.', 'Take pictures to look back on.', 'Establish traditions, even small ones.'] }],
        // Caused
        ['Enjoy the moment with them.', { title: 'Share the Moment', steps: ['Be present and soak in the shared happiness.', 'Smile and show you are enjoying it too.', 'Acknowledge the positive feeling in the room.'] }],
        ['Acknowledge their happiness.', { title: 'Acknowledge Their Feeling', steps: ['Say something like, "It\'s so great to see you this happy."', 'This validates their emotion and your role in it.', 'It shows you are paying attention.'] }],
        ['Accept their thanks gracefully.', { title: 'Accept Thanks', steps: ['A simple "You\'re welcome" or "I was happy to do it" is perfect.', 'Avoid downplaying your action.', 'Accepting thanks allows them to express their gratitude fully.'] }],
        ['Reflect on the positive action you took.', { title: 'Positive Reinforcement', steps: ['Take a moment to recognize what you did.', 'Acknowledge that your action had a positive impact.', 'This reinforces kind and thoughtful behavior in yourself.'] }],
        ['Let it reinforce your positive behavior.', { title: 'Reinforce Good Habits', steps: ['Connect your action to the positive outcome.', 'Use this feeling as motivation to repeat similar behaviors.', 'Recognize your own power to create joy.'] }],
        ['Continue being a positive force.', { title: 'Be a Positive Force', steps: ['Look for other small opportunities to be kind or helpful.', 'Understand that small actions can have a big impact.', 'Make positivity a conscious part of your interactions.'] }],
        ['Understand what makes people happy.', { title: 'Learn About Others', steps: ['Pay attention to what brings smiles to the people in your life.', 'Listen to their stories and values.', 'This builds empathy and deepens relationships.'] }],
        ['Incorporate kindness into your daily life.', { title: 'Daily Kindness', steps: ['Look for small opportunities to be kind each day.', 'It could be a compliment, a helping hand, or just a smile.', 'Kindness is a practice that strengthens with use.'] }],
        ['Value the positive impact you can have on others.', { title: 'Value Your Impact', steps: ['Recognize that you have the ability to make someone\'s day better.', 'Take pride in being a source of positivity.', 'Let this empower you in your interactions.'] }],

        // --- Sadness ---
        // Self
        ['Allow yourself to cry if you need to.', { title: 'Permit Your Tears', steps: ['Find a safe, private space.', 'Acknowledge that crying is a natural and healthy release.', 'Don\'t judge your feelings; just let them flow.', 'Have a glass of water afterward to rehydrate.'] }],
        ['Wrap yourself in a warm blanket.', { title: 'Seek Physical Comfort', steps: ['Find your softest, most comforting blanket.', 'Wrap it tightly around yourself.', 'Focus on the sensation of warmth and pressure, which can be physiologically calming.'] }],
        ['Drink a warm, comforting beverage.', { title: 'Sip Something Warm', steps: ['Prepare a warm, non-caffeinated drink like herbal tea.', 'Hold the warm mug in your hands and feel the heat.', 'Sip slowly, focusing on the comforting sensation.'] }],
        ['Talk to a trusted friend or family member.', { title: 'Connect With Someone', steps: ['Think of someone you trust who is a good listener.', 'Send a simple message: "Do you have a moment? I\'m feeling a bit down."', 'Share what you\'re comfortable sharing.'] }],
        ['Watch a comforting movie or show.', { title: 'Comforting Media', steps: ['Choose something familiar and low-stress.', 'The goal is comfort, not complex new content.', 'Allow yourself to be absorbed in a simple story.'] }],
        ['Go for a gentle walk in nature.', { title: 'Walk in Nature', steps: ['Put on comfortable shoes.', 'Walk for 10-15 minutes in a park or green space.', 'Pay attention to your senses: the air, the sounds, the sights.'] }],
        ['Seek professional help if sadness persists.', { title: 'Seek Professional Help', steps: ['Recognize that needing help is a sign of strength.', 'Research therapists or counseling services in your area.', 'Your doctor can be a good starting point for a referral.'] }],
        ['Practice self-compassion.', { title: 'Self-Compassion', steps: ['Speak to yourself as you would a dear friend.', 'Acknowledge your pain without judgment.', 'Remind yourself that it\'s okay to not be okay.'] }],
        ['Connect with a support group.', { title: 'Find a Support Group', steps: ['Look for groups related to what you\'re experiencing.', 'Online or in-person groups can both be valuable.', 'Sharing with others who understand can reduce feelings of isolation.'] }],
        // Friend
        ['Just be there and listen.', { title: 'Listen Without Fixing', steps: ['Your presence is the most important thing.', 'Let them talk without interrupting.', 'You don\'t need to have answers; just listen.'] }],
        ['Offer a hug if appropriate.', { title: 'Offer Physical Comfort', steps: ['Ask first: "Would a hug help?"', 'A comforting touch can be very grounding.', 'Respect their answer if they say no.'] }],
        ['Say "It\'s okay to be sad."', { title: 'Validate Their Feelings', steps: ['Directly give them permission to feel their emotion.', 'This removes the pressure to "cheer up".', 'It shows you accept them as they are right now.'] }],
        ['Check in on them regularly.', { title: 'Regular Check-ins', steps: ['A simple text like "Thinking of you" can mean a lot.', 'It shows your support is ongoing, not just a one-time thing.', 'Don\'t pressure them to reply.'] }],
        ['Help with practical tasks like cooking or cleaning.', { title: 'Offer Practical Help', steps: ['Sadness can make daily tasks overwhelming.', 'Be specific: "Can I bring you dinner tonight?" is better than "Let me know if you need anything."', 'Helping with small things can be a huge relief.'] }],
        ['Invite them for a low-key activity.', { title: 'Low-Key Invitation', steps: ['Suggest something with no pressure, like watching a movie at home.', 'Make it easy for them to say yes or no.', 'Getting out, even for a short time, can help.'] }],
        ['Encourage them to seek help if needed.', { title: 'Encourage Professional Help', steps: ['Gently suggest it: "Have you considered talking to someone about this?"', 'Frame it as a tool for their well-being.', 'You can offer to help them find resources.'] }],
        ['Be patient with their healing process.', { title: 'Be Patient', steps: ['Healing is not linear; there will be good and bad days.', 'Don\'t rush them or set a timeline for their grief.', 'Your consistent, patient support is a gift.'] }],
        ['Remind them you care.', { title: 'Remind Them You Care', steps: ['Simply say, "I care about you and I\'m here for you."', 'These words can be a powerful anchor in a difficult time.', 'Reiterate that they are not a burden.'] }],
        // Caused
        ['Apologize sincerely and specifically.', { title: 'Sincere Apology', steps: ['Take responsibility. Start with "I apologize for..."', 'Name the specific action: "...for what I said/did."', 'Avoid excuses or "but..." statements.'] }],
        ['Listen to their perspective without getting defensive.', { title: 'Listen to Understand', steps: ['Your goal is to understand their hurt, not to defend your actions.', 'Let them speak fully without interruption.', 'Nod and use small verbal cues to show you are listening.'] }],
        ['Acknowledge their pain: "I understand why you\'re hurt."', { title: 'Acknowledge Their Pain', steps: ['Validate their feeling by connecting it to your action.', 'This shows you understand the impact of your behavior.', 'It is a crucial step in showing empathy.'] }],
        ['Give them space, but let them know you\'re there.', { title: 'Offer Space', steps: ['Say, "I\'ll give you some space, but please know I\'m here when you\'re ready to talk."', 'This respects their need to process while keeping the door open.', 'Don\'t push for immediate resolution.'] }],
        ['Ask how you can make things right.', { title: 'Ask to Make Amends', steps: ['Ask, "What can I do to help make this better?"', 'Be prepared to listen to their answer.', 'This shows a genuine desire to repair the harm.'] }],
        ['Reflect on your actions.', { title: 'Reflect on Your Actions', steps: ['Take time to understand what led to your behavior.', 'Consider what you could have done differently.', 'This self-reflection is key to avoiding future mistakes.'] }],
        ['Learn from the mistake.', { title: 'Learn from It', steps: ['Identify the lesson from this experience.', 'Commit to a specific change in your behavior.', 'Turn a negative event into an opportunity for growth.'] }],
        ['Work on rebuilding trust through consistent, positive actions.', { title: 'Rebuild Trust', steps: ['Trust is rebuilt through actions, not words.', 'Be reliable, considerate, and follow through on your commitments.', 'Understand that this process takes time.'] }],
        ['Practice better communication.', { title: 'Improve Communication', steps: ['Learn to use "I feel" statements to express your own needs.', 'Practice active listening in all your conversations.', 'Commit to being more mindful in your interactions.'] }],

        // --- Anger ---
        // Self
        ['Take 10 deep, slow breaths.', { title: 'Deep Breathing', steps: ['Find a comfortable seated position.', 'Inhale slowly through your nose for a count of 4.', 'Hold your breath for a count of 4.', 'Exhale slowly through your mouth for a count of 6.', 'Repeat this cycle 5-10 times.'] }],
        ['Count to 20 before reacting.', { title: 'Pause and Count', steps: ['Stop what you are doing.', 'Turn away from the trigger if possible.', 'Slowly count to 20, focusing only on the numbers.', 'Re-evaluate your urge to react after the pause.'] }],
        ['Leave the situation for a few minutes.', { title: 'Take a Time-Out', steps: ['State calmly, "I need to take a break for a few minutes."', 'Physically remove yourself from the situation.', 'Go to a different room or step outside.', 'Return only when you feel calmer.'] }],
        ['Engage in physical activity like running or punching a pillow.', { title: 'Release Physical Energy', steps: ['Choose a safe, intense physical activity (e.g., brisk walk, running).', 'Engage in the activity for 5-10 minutes.', 'Focus on the physical sensations, letting the energy move through you.'] }],
        ['Write down your feelings in a journal.', { title: 'Expressive Writing', steps: ['Open a journal or a blank document.', 'Write nonstop for 5 minutes about what is making you angry.', 'Do not censor yourself. The goal is to get it out.', 'You can delete or tear up the paper afterwards.'] }],
        ['Listen to intense music.', { title: 'Listen to Intense Music', steps: ['Choose music that matches your energy level.', 'Listen with headphones to fully immerse yourself.', 'This can help process the emotion without acting on it.'] }],
        ['Identify your anger triggers.', { title: 'Identify Triggers', steps: ['Notice when you feel angry and what just happened.', 'Keep a log for a week to see if patterns emerge.', 'Understanding your triggers is the first step to managing them.'] }],
        ['Learn healthy communication skills.', { title: 'Healthy Communication', steps: ['Practice using "I" statements: "I feel angry when..."', 'Avoid blaming language like "You always..."', 'State your needs clearly and calmly.'] }],
        ['Practice relaxation techniques like meditation.', { title: 'Practice Relaxation', steps: ['Schedule 5-10 minutes each day for a relaxation practice.', 'Try guided meditation, progressive muscle relaxation, or yoga.', 'Regular practice helps lower your baseline stress level.'] }],
        // Friend
        ['Stay calm.', { title: 'Stay Calm', steps: ['Take a deep breath yourself before responding.', 'Keep your voice level and your body language open.', 'Your calmness can help de-escalate the situation.'] }],
        ['Listen without judging or interrupting.', { title: 'Just Listen', steps: ['Let them vent and get their feelings out.', 'Your job is to be a witness, not a judge.', 'Wait for them to finish before you speak.'] }],
        ['Validate their feelings: "I can see why you\'re so angry."', { title: 'Validate Their Anger', steps: ['Validation doesn\'t mean you agree with their actions.', 'It means you understand their emotional experience.', 'Saying "That sounds incredibly frustrating" shows you are listening.'] }],
        ['Give them space to cool down.', { title: 'Offer Space', steps: ['Ask, "Do you need some space right now?"', 'Respect their need to be alone to process.', 'Let them know you\'ll be there when they\'re ready.'] }],
        ['Suggest a physical activity to burn off steam.', { title: 'Suggest Activity', steps: ['Gently suggest, "Want to go for a walk and talk about it?"', 'Physical movement can help dissipate angry energy.', 'Don\'t push if they are not interested.'] }],
        ['Avoid telling them to "calm down."', { title: 'Avoid "Calm Down"', steps: ['This phrase can feel dismissive and often makes people more angry.', 'Focus on validating and listening instead.', 'Allow them to feel their emotion.'] }],
        ['Help them identify the root of their anger.', { title: 'Find the Root Cause', steps: ['Once they are calmer, ask gentle questions like, "What do you think is really bothering you?"', 'Anger is often a secondary emotion covering up hurt or fear.', 'Help them explore what\'s underneath.'] }],
        ['Encourage constructive ways to express their feelings.', { title: 'Constructive Expression', steps: ['Help them brainstorm ways to address the problem.', 'This could be writing a letter, planning a calm conversation, etc.', 'Shift the focus from venting to problem-solving.'] }],
        ['Be a reliable, calm presence.', { title: 'Be a Calm Presence', steps: ['Your consistency shows them you are a safe person to talk to.', 'Don\'t take their anger personally.', 'Your stable support can be a huge help.'] }],
        // Caused
        ['Give them space.', { title: 'Give Them Space', steps: ['Recognize they may need time before they can talk calmly.', 'Say, "I see you\'re angry. I\'ll give you some space and we can talk later."', 'Do not follow them or demand to talk immediately.'] }],
        ['Listen to understand, not to reply.', { title: 'Listen to Understand', steps: ['When they are ready to talk, put your own agenda aside.', 'Focus completely on what they are saying and feeling.', 'Resist the urge to plan your rebuttal while they are speaking.'] }],
        ['Acknowledge their feelings without making excuses.', { title: 'Acknowledge, Don\'t Excuse', steps: ['Say, "I understand that what I did made you angry."', 'This is different from saying "I\'m sorry, but..."', 'Take responsibility for the impact of your actions.'] }],
        ['Apologize for your role in the situation.', { title: 'Apologize for Your Role', steps: ['Offer a sincere apology for the specific actions that caused the anger.', 'Even if you don\'t agree with their entire perspective, you can apologize for your part.', 'A genuine apology can be very disarming.'] }],
        ['Offer to discuss the issue when you are both calm.', { title: 'Schedule a Calm Conversation', steps: ['Suggest a specific time: "Can we talk about this in an hour after we\'ve both cooled down?"', 'This sets a clear plan for resolution.', 'It prevents a screaming match.'] }],
        ['Focus on finding a solution, not winning.', { title: 'Focus on Solutions', steps: ['Approach the conversation as a team trying to solve a problem.', 'Ask, "How can we work together to fix this?"', 'Let go of the need to be "right."'] }],
        ['Reflect on your behavior and its impact.', { title: 'Reflect on Your Behavior', steps: ['Take time to honestly assess your actions.', 'How did your words or behavior contribute to the situation?', 'What could you do differently next time?'] }],
        ['Commit to changing the behavior that caused the anger.', { title: 'Commit to Change', steps: ['If you\'ve identified a harmful pattern, make a concrete plan to change it.', 'Communicate this commitment to the other person.', 'Follow through with actions.'] }],
        ['Work on communication and empathy.', { title: 'Practice Empathy', steps: ['Try to genuinely see the situation from their point of view.', 'Practice active listening in all your conversations.', 'Read about healthy communication strategies.'] }],
        
        // --- Fear ---
        // Self
        ['Focus on your breathing; inhale for 4, hold for 4, exhale for 6.', { title: 'Controlled Breathing', steps: ['Inhale slowly through your nose for a count of 4.', 'Gently hold your breath for a count of 4.', 'Exhale slowly and completely through your mouth for a count of 6.', 'Repeat 5-10 times. A longer exhale calms the nervous system.'] }],
        ['Ground yourself: name 5 things you see, 4 you feel, 3 you hear.', { title: '5-4-3-2-1 Grounding', steps: ['Look around and name 5 things you can SEE.', 'Acknowledge 4 things you can physically FEEL (e.g., your feet on the floor).', 'Listen and identify 3 things you can HEAR.', 'Identify 2 things you can SMELL.', 'Name 1 thing you can TASTE.'], toolId: 'grounding' }],
        ['Hold a piece of ice.', { title: 'Intense Sensation', steps: ['Safely get a piece of ice from the freezer.', 'Hold it in the palm of your hand.', 'Focus all your attention on the intense cold sensation.', 'This strong physical feeling can interrupt an overwhelming emotion.'] }],
        ['Talk about your fear with someone you trust.', { title: 'Voice Your Fear', steps: ['Think of someone who makes you feel safe.', 'Reach out and tell them you are feeling scared.', 'Putting the fear into words can make it feel more manageable.'] }],
        ['Write down what you are afraid of and why.', { title: 'Write It Out', steps: ['Be specific about the fear.', 'Explore the "what if" scenarios that are running through your mind.', 'Seeing it on paper can sometimes make it seem less powerful.'] }],
        ['Do something that makes you feel safe and comfortable.', { title: 'Seek Comfort', steps: ['This could be watching a favorite movie, listening to calming music, or wrapping up in a blanket.', 'Engage in a low-stress, familiar activity.', 'The goal is to create a sense of safety.'] }],
        ['Break down the fear into smaller, manageable steps.', { title: 'Break It Down', steps: ['Identify the big fear.', 'Brainstorm the smallest possible steps to approach it.', 'The first step should feel very easy and achievable.'] }],
        ['Gradually expose yourself to what you fear in a safe way.', { title: 'Gradual Exposure', steps: ['Start with the easiest step from your list.', 'Stay in the situation until your fear starts to decrease.', 'Repeat until the step is no longer scary, then move to the next one.'] }],
        ['Consider therapy (like CBT) for persistent fears.', { title: 'Consider Therapy', steps: ['Cognitive Behavioral Therapy (CBT) is highly effective for anxiety and fears.', 'A therapist can provide tools and guidance in a safe environment.', 'Seeking help is a proactive and courageous step.'] }],
        // Friend
        ['Speak in a calm, reassuring voice.', { title: 'Be a Calm Presence', steps: ['Lower your own voice and speak slowly.', 'Your calm demeanor can be co-regulating.', 'Avoid frantic energy or sudden movements.'] }],
        ['Remind them they are safe with you.', { title: 'Reassure Safety', steps: ['Say, "You are safe right now. I am here with you."', 'This helps ground them in the present moment.', 'Repeat it as needed.'] }],
        ['Ask what would help them feel safer right now.', { title: 'Ask What They Need', steps: ['Instead of guessing, ask directly: "What can I do to help you feel safer?"', 'They are the expert on their own experience.', 'This empowers them in a moment of powerlessness.'] }],
        ['Don\'t dismiss their fears.', { title: 'Validate Their Fear', steps: ['Avoid saying "Don\'t worry" or "It\'s not a big deal."', 'Instead, say "That sounds really scary."', 'Validation shows you respect their feelings.'] }],
        ['Help them think through the fear logically, but only if they are ready.', { title: 'Gentle Logic', steps: ['Ask gently, "What is the evidence for that fear?" or "What\'s a less scary possibility?"', 'Do not push if this increases their anxiety.', 'This should only be done when they have calmed down a little.'] }],
        ['Distract them with a pleasant activity.', { title: 'Pleasant Distraction', steps: ['Suggest a simple, engaging activity.', 'This could be watching a funny video, listening to music, or telling a story.', 'Distraction can give their mind a break from the fear loop.'] }],
        ['Support them in facing their fears at their own pace.', { title: 'Support, Don\'t Push', steps: ['Encourage them to take small steps they feel ready for.', 'Celebrate their courage for trying, no matter the outcome.', 'Your role is to be a cheerleader, not a coach.'] }],
        ['Celebrate small victories with them.', { title: 'Celebrate Small Wins', steps: ['Acknowledge every step forward, no matter how small.', 'Say, "I\'m so proud of you for trying that."', 'Positive reinforcement helps build momentum.'] }],
        ['Encourage them to seek professional help if it\'s debilitating.', { title: 'Encourage Professional Help', steps: ['If fear is impacting their daily life, gently suggest therapy.', 'Say, "It seems like this fear is causing you a lot of pain. Have you thought about talking to a professional?"', 'Offer to help them find resources if they are open to it.'] }],
        // Caused
        ['Stop the action causing the fear immediately.', { title: 'Stop Immediately', steps: ['The moment you realize you are causing fear, cease the action.', 'No explanation or justification is needed at this point.', 'The first priority is to stop the threat.'] }],
        ['Give them physical space.', { title: 'Give Them Space', steps: ['Take a step back to create physical distance.', 'Open your body language (e.g., uncross your arms).', 'This non-verbally communicates that you are not a threat.'] }],
        ['Apologize for making them feel unsafe.', { title: 'Apologize for the Impact', steps: ['Focus on their feeling: "I am so sorry that I made you feel unsafe."', 'This is more important than your intention in that moment.', 'Acknowledge the impact of your behavior.'] }],
        ['Reassure them of your intentions (if they were good).', { title: 'Clarify Intentions Calmly', steps: ['Once they feel safer, you can briefly explain your intention.', 'For example, "My intention was X, but I see now that it came across as Y."', 'Keep it short and avoid making excuses.'] }],
        ['Ask what you can do to restore their sense of safety.', { title: 'Ask to Restore Safety', steps: ['Ask, "What do you need to feel safe right now?"', 'Be willing to listen and follow their lead.', 'This gives them back a sense of control.'] }],
        ['Listen to their experience without justification.', { title: 'Listen to Their Experience', steps: ['Let them tell you how they felt.', 'Do not interrupt or say "I didn\'t mean it that way."', 'Your job is to understand their perspective.'] }],
        ['Understand what you did to cause fear.', { title: 'Understand the Cause', steps: ['Reflect on your words, tone, and body language.', 'What specific part of your behavior was threatening?', 'This understanding is crucial to prevent it from happening again.'] }],
        ['Commit to creating a safe environment.', { title: 'Commit to Safety', steps: ['Verbally commit to not repeating the behavior.', 'Show through your future actions that you are a safe person.', 'Be mindful of their triggers in the future.'] }],
        ['Be patient, as trust and safety take time to rebuild.', { title: 'Be Patient', steps: ['Do not rush them to "get over it."', 'Consistently show through your behavior that you are trustworthy.', 'Rebuilding a sense of safety is a process.'] }],
        
        // --- Surprise ---
        // Self
        ['Take a moment to process the new information.', { title: 'Pause and Process', steps: ['Take a deep breath before reacting.', 'Give your brain a few seconds to catch up.', 'It\'s okay to not have an immediate reaction.'] }],
        ['Breathe and allow the feeling to settle.', { title: 'Breathe Through It', steps: ['Take a few slow, steady breaths.', 'Notice the physical sensations of surprise in your body.', 'Allow the initial shock to pass.'] }],
        ['Identify if the surprise is pleasant, unpleasant, or neutral.', { title: 'Categorize the Surprise', steps: ['Ask yourself: "Is this good, bad, or just different?"', 'This helps you know how to proceed.', 'Your first emotional label will guide your next steps.'] }],
        ['Talk about the surprising event with someone.', { title: 'Talk It Out', steps: ['Find someone to share the news with.', 'Saying it out loud can help you process it.', 'Get another person\'s perspective.'] }],
        ['Journal about your reaction.', { title: 'Journal Your Reaction', steps: ['Write down what happened and how you feel about it.', 'Explore your initial thoughts and feelings without judgment.', 'This can bring clarity to your reaction.'] }],
        ['Adjust your plans or understanding based on the new reality.', { title: 'Adjust Your View', steps: ['Acknowledge that something has changed.', 'Consider what this new information means for your plans or beliefs.', 'Be open to shifting your perspective.'] }],
        ['Reflect on how you react to the unexpected.', { title: 'Reflect on Your Reaction', steps: ['Notice your typical pattern when surprised.', 'Are you open and curious, or resistant and anxious?', 'This awareness can help you manage future surprises.'] }],
        ['Cultivate mental flexibility and adaptability.', { title: 'Cultivate Flexibility', steps: ['Practice "going with the flow" in small, everyday situations.', 'Challenge rigid thinking patterns.', 'View change as an opportunity, not just a threat.'] }],
        ['Learn from the experience.', { title: 'Learn from the Surprise', steps: ['What did this surprise teach you?', 'Did it reveal something new about yourself, others, or the world?', 'Extract a lesson to carry forward.'] }],
        // Friend
        ['Give them a moment to react.', { title: 'Give Them a Moment', steps: ['Don\'t rush them for a response.', 'Allow them to have their own natural reaction.', 'Stay quiet and observe their cues.'] }],
        ['Ask "How are you feeling about this?"', { title: 'Ask About Their Feelings', steps: ['This open-ended question invites them to share.', 'It shows you care about their emotional response.', 'Listen carefully to their answer.'] }],
        ['Mirror their energy (e.g., be excited for good news).', { title: 'Mirror Their Energy', steps: ['If they are excited, show excitement too.', 'If they are concerned, show gentle concern.', 'This creates a sense of connection and validation.'] }],
        ['Help them process the information.', { title: 'Help Them Process', steps: ['Ask clarifying questions if they seem confused.', 'Summarize the information to ensure you both understand it.', 'Be a calm sounding board for their thoughts.'] }],
        ['Offer practical support if the surprise requires action.', { title: 'Offer Practical Support', steps: ['Ask, "What is the next step?" or "How can I help with this?"', 'This moves from shock to action.', 'Help them break down any necessary tasks.'] }],
        ['Be a sounding board for their thoughts.', { title: 'Be a Sounding Board', steps: ['Let them talk through their thoughts and feelings.', 'You don\'t need to offer solutions.', 'Just listening can be incredibly helpful.'] }],
        ['Help them adapt to the new situation.', { title: 'Help Them Adapt', steps: ['Brainstorm potential next steps together.', 'Offer to help with any resulting tasks or plans.', 'Be a supportive partner in navigating the change.'] }],
        ['Check in later to see how they are doing.', { title: 'Follow Up', steps: ['A day or two later, send a message asking how they are processing the news.', 'This shows your support is ongoing.', 'It gives them another chance to talk if needed.'] }],
        ['Be a stable presence in their life.', { title: 'Be a Stable Presence', steps: ['Surprises can be destabilizing.', 'Your consistent friendship provides a sense of security.', 'Be reliable and dependable.'] }],
        // Caused
        ['Observe their reaction to gauge the nature of the surprise.', { title: 'Gauge Their Reaction', steps: ['Watch their body language and facial expression.', 'Is it a happy surprise or an unwelcome shock?', 'Your next step depends on their reaction.'] }],
        ['Explain your reasoning if necessary.', { title: 'Explain Your Reasoning', steps: ['If they seem confused or upset, briefly explain why you did what you did.', 'Keep it concise and focused on the rationale.', 'Avoid being defensive.'] }],
        ['Give them time and space to process.', { title: 'Give Them Processing Time', steps: ['Don\'t demand an immediate positive reaction.', 'Say, "I know this is a lot to take in. Take your time."', 'Allow them to sit with the new information.'] }],
        ['Answer any questions they might have.', { title: 'Answer Their Questions', steps: ['Be open to answering their questions honestly.', 'This helps them understand the situation fully.', 'Clear communication is key.'] }],
        ['Apologize if it was an unpleasant surprise you could have handled better.', { title: 'Apologize if Needed', steps: ['If you delivered the news poorly, apologize for that.', 'Say, "I\'m sorry if the way I told you was jarring."', 'Take responsibility for your delivery.'] }],
        ['Share in their joy if it was a happy surprise.', { title: 'Share the Joy', steps: ['If they are happy, be happy with them.', 'Enjoy the positive moment you created.', 'Let them see your own joy.'] }],
        ['Consider how to deliver unexpected news in the future.', { title: 'Reflect on Delivery', steps: ['Think about what went well and what could be improved.', 'Consider the timing, setting, and your choice of words.', 'Learn from this experience for next time.'] }],
        ['Build a reputation for clear communication.', { title: 'Be a Clear Communicator', steps: ['Strive to be transparent and timely in your communication.', 'This reduces the chance of negative surprises.', 'People will trust you more.'] }],
        ['Enjoy the fun of positive surprises.', { title: 'Enjoy Positive Surprises', steps: ['Recognize the joy that a well-planned surprise can bring.', 'Take pleasure in making someone happy.', 'Don\'t be afraid to create positive, unexpected moments.'] }],
        
        // --- Anticipation ---
        // Self
        ['Acknowledge the feeling.', { title: 'Acknowledge the Feeling', steps: ['Simply notice and name the feeling: "I am feeling anticipation."', 'Don\'t judge it as good or bad.', 'This simple act of mindfulness can be very grounding.'] }],
        ['Take a few deep breaths to manage excitement or anxiety.', { title: 'Manage with Breath', steps: ['Use the "Controlled Breathing" technique (Inhale 4, Hold 4, Exhale 6).', 'This works for both excited and anxious energy.', 'It helps calm your physical symptoms.'] }],
        ['Focus on the present moment for a bit.', { title: 'Focus on the Present', steps: ['Use the 5-4-3-2-1 Grounding technique.', 'Engage in a simple task that requires your full attention, like washing dishes.', 'This gives your mind a break from future-tripping.'] }],
        ['Prepare for the event if possible.', { title: 'Prepare for the Event', steps: ['Break down what needs to be done into small, manageable tasks.', 'Completing a small preparation task can increase feelings of control.', 'This channels the energy productively.'] }],
        ['Talk about your feelings with someone.', { title: 'Talk About It', steps: ['Share your excitement or anxiety with a friend.', 'Speaking the feeling out loud can make it feel more manageable.', 'It can be helpful to get an outside perspective.'] }],
        ['Distract yourself with a pleasant activity if the anticipation is overwhelming.', { title: 'Pleasant Distraction', steps: ['Choose an engaging activity you enjoy.', 'This could be reading a book, watching a show, or a hobby.', 'The goal is to give your mind a rest from the anticipation.'] }],
        ['Practice mindfulness to manage future-oriented thoughts.', { title: 'Practice Mindfulness', steps: ['When you notice your mind racing ahead, gently bring it back to the present moment.', 'Focus on your breath for a few cycles.', 'Do this without judgment each time your mind wanders.'] }],
        ['Learn to differentiate between excited and anxious anticipation.', { title: 'Differentiate Feelings', steps: ['Pay attention to the physical sensations.', 'Is it a tense, restrictive feeling (anxiety) or an open, energetic feeling (excitement)?', 'This awareness can help you respond more effectively.'] }],
        ['Set realistic expectations for future events.', { title: 'Realistic Expectations', steps: ['Acknowledge that no event will be perfect.', 'Focus on what you can control and let go of what you can\'t.', 'This can reduce pressure and anxiety.'] }],
        // Friend
        ['Share in their excitement.', { title: 'Share Their Excitement', steps: ['If they are excited, match their energy.', 'Say, "That\'s so exciting! Tell me more about it!"', 'This validates their positive feelings.'] }],
        ['Listen to them talk about what they\'re anticipating.', { title: 'Listen to Their Thoughts', steps: ['Let them share their hopes, plans, or even fears about the event.', 'Be a supportive sounding board.', 'Ask questions to show you are engaged.'] }],
        ['Ask them how they feel about it.', { title: 'Ask How They Feel', steps: ['Go beyond the practical details.', 'Ask, "How are you feeling about it all?"', 'This opens the door for a deeper conversation.'] }],
        ['Help them prepare if they need it.', { title: 'Offer to Help Prepare', steps: ['Ask, "Is there anything I can do to help you get ready?"', 'This is a practical way to show your support.', 'It can also help ease their anxiety.'] }],
        ['Offer to be there for the event.', { title: 'Offer to Be There', steps: ['If appropriate, offer to attend the event with them.', 'Knowing they have a supporter there can make a big difference.', 'Your presence can be very reassuring.'] }],
        ['Distract them if they seem anxious.', { title: 'Distract If Anxious', steps: ['If their anticipation is leaning towards anxiety, suggest a different topic or activity.', 'Say, "Let\'s take a break from thinking about that for a bit."', 'A short distraction can be a welcome relief.'] }],
        ['Be a supportive presence for their goals.', { title: 'Support Their Goals', steps: ['Show that you believe in them and their ability to handle the upcoming event.', 'Remind them of their strengths.', 'Be their cheerleader.'] }],
        ['Celebrate their successes with them.', { title: 'Celebrate With Them', steps: ['After the event, check in to see how it went.', 'Be ready to celebrate their achievements.', 'This completes the supportive cycle.'] }],
        ['Help them manage disappointment if things don\'t go as planned.', { title: 'Help Manage Disappointment', steps: ['If the event is a letdown, be there to listen.', 'Validate their feelings of disappointment.', 'Remind them that it\'s okay for things to not go perfectly.'] }],
        // Caused
        ['Enjoy their excitement if it\'s positive.', { title: 'Enjoy Their Excitement', steps: ['Take pleasure in the positive anticipation you\'ve created.', 'Smile and share in their good feeling.', 'Let them see that you are happy they are excited.'] }],
        ['Clarify expectations if needed.', { title: 'Clarify Expectations', steps: ['If they seem to have unrealistic expectations, gently clarify what will happen.', 'This can prevent future disappointment.', 'Honest communication is key.'] }],
        ['Be mindful of their feelings.', { title: 'Be Mindful of Them', steps: ['Pay attention to whether their anticipation seems happy or anxious.', 'Adjust your approach based on their emotional state.', 'Show that you are attuned to their feelings.'] }],
        ['Follow through on your promises.', { title: 'Follow Through', steps: ['The most important thing you can do is be reliable.', 'Do what you said you would do.', 'This builds trust and ensures the anticipation pays off.'] }],
        ['Communicate clearly about upcoming plans.', { title: 'Communicate Clearly', steps: ['Provide necessary information in a timely manner.', 'This can reduce anxiety caused by uncertainty.', 'Keep them in the loop.'] }],
        ['Share information to reduce their anxiety.', { title: 'Reduce Anxiety with Info', steps: ['If you sense they are anxious, providing more details can help.', 'Anticipate their questions and answer them proactively.', 'Information can increase feelings of control.'] }],
        ['Be reliable and trustworthy.', { title: 'Be Reliable', steps: ['Consistently following through on your commitments makes you a trustworthy person.', 'This builds a strong foundation for any relationship.', 'Your reliability will be appreciated.'] }],
        ['Build a reputation for creating positive experiences.', { title: 'Create Positive Experiences', steps: ['Strive to make the events you plan enjoyable and well-managed.', 'People will come to look forward to things involving you.', 'This is a great reputation to have.'] }],
        ['Learn how to manage others\' expectations effectively.', { title: 'Manage Expectations', steps: ['Learn to be clear and honest in your communication.', 'Under-promise and over-deliver when possible.', 'This is a valuable skill in all areas of life.'] }],

        // --- Disgust ---
        // Self
        ['Physically move away from the source of disgust.', { title: 'Create Distance', steps: ['Identify the source of your disgust.', 'Calmly and immediately move to a different space.', 'This creates both physical and psychological distance.'] }],
        ['Take a deep breath of fresh air.', { title: 'Breathe Fresh Air', steps: ['If possible, step outside for a moment.', 'Focus on the sensation of clean air filling your lungs.', 'This can help "clear your head."'] }],
        ['Focus on a neutral or pleasant sensation.', { title: 'Shift Your Focus', steps: ['After creating distance, find something pleasant to focus on.', 'Look at a picture you like, listen to a calming song, or smell something nice.', 'This helps reset your emotional state.'] }],
        ['Wash your hands or take a shower to feel clean.', { title: 'Cleanse Yourself', steps: ['The physical act of washing can be psychologically cleansing.', 'Use soap and warm water.', 'Focus on the sensation of being clean.'] }],
        ['Talk about what disgusted you with someone.', { title: 'Talk About It', steps: ['Choose a trusted friend to talk to.', 'Describing the experience can help you process it.', 'Sometimes, hearing another person\'s perspective can be helpful.'] }],
        ['Engage in an activity that you find pleasant and clean.', { title: 'Engage in a Pleasant Activity', steps: ['Choose something that feels orderly and positive.', 'This could be organizing a drawer, reading a book, or listening to music.', 'It counteracts the feeling of contamination.'] }],
        ['Identify your triggers for disgust.', { title: 'Identify Triggers', steps: ['Notice what consistently causes a disgust reaction in you.', 'Is it a physical thing, a behavior, or a moral issue?', 'Awareness is the first step to managing your reaction.'] }],
        ['If disgust is moral, reflect on your values.', { title: 'Reflect on Moral Disgust', steps: ['Moral disgust often points to a deeply held value being violated.', 'Ask yourself: "What value of mine was crossed?"', 'This can be a powerful insight into your own moral compass.'] }],
        ['Learn to set boundaries to avoid situations that cause disgust.', { title: 'Set Boundaries', steps: ['If a person or situation consistently triggers disgust, it may be necessary to limit your exposure.', 'Practice politely saying "no" or leaving situations that violate your boundaries.', 'Protecting your well-being is important.'] }],
        // Friend
        ['Validate their feeling: "That does sound disgusting."', { title: 'Validate Their Feeling', steps: ['Show them that you understand their reaction.', 'Don\'t question or minimize their feeling.', 'Simple validation can be very comforting.'] }],
        ['Help them move away from the source.', { title: 'Help Them Leave', steps: ['Offer to leave the situation with them.', 'This provides solidarity and practical support.', 'Say, "Let\'s get out of here."'] }],
        ['Offer them a tissue or a drink of water.', { title: 'Offer Simple Comforts', steps: ['Small, practical gestures can be very helpful.', 'It shows you are thinking of their comfort.', 'Don\'t push if they decline.'] }],
        ['Listen to them vent about it.', { title: 'Let Them Vent', steps: ['Allow them to express their feelings of revulsion.', 'You don\'t need to solve the problem.', 'Just listening is a form of support.'] }],
        ['Don\'t minimize their feeling.', { title: 'Don\'t Minimize', steps: ['Avoid saying things like "It\'s not that bad."', 'Respect that their reaction is real for them.', 'Minimizing can feel very invalidating.'] }],
        ['Help them distract themselves with something pleasant.', { title: 'Offer a Pleasant Distraction', steps: ['Suggest a change of scenery or topic.', 'Say, "Let\'s think about something else for a while."', 'A positive distraction can help reset their mood.'] }],
        ['Support them in setting boundaries.', { title: 'Support Their Boundaries', steps: ['If they decide to avoid a person or situation, support their choice.', 'Don\'t pressure them to re-engage.', 'Respect their decision to protect themselves.'] }],
        ['Understand their sensitivities.', { title: 'Understand Their Sensitivities', steps: ['Make a mental note of what triggers their disgust.', 'This will help you be a more considerate friend in the future.', 'It shows you pay attention and care.'] }],
        ['Help them process moral disgust if it\'s related to an injustice.', { title: 'Process Moral Disgust', steps: ['If their disgust is about an injustice, listen to their thoughts.', 'You can ask, "What about that feels so wrong to you?"', 'This can lead to a meaningful conversation about values.'] }],
        // Caused
        ['Stop the behavior immediately.', { title: 'Stop Immediately', steps: ['The moment you realize your action is causing disgust, cease.', 'There is no need to justify or explain in this first moment.', 'The priority is to stop the offending action.'] }],
        ['Apologize sincerely.', { title: 'Apologize Sincerely', steps: ['Offer a simple, direct apology.', '"I\'m so sorry. I didn\'t realize that would have that effect."', 'Take responsibility for your action.'] }],
        ['Give them space.', { title: 'Give Them Space', steps: ['The other person may need some physical distance from you.', 'Respect this need without question.', 'Say, "I\'ll give you some space."'] }],
        ['Listen to understand why they were disgusted.', { title: 'Listen to Understand', steps: ['When they are ready, ask for more information.', '"Can you help me understand what about that was disgusting to you?"', 'Listen without being defensive.'] }],
        ['Don\'t be defensive; acknowledge their reaction.', { title: 'Acknowledge Their Reaction', steps: ['Accept their feeling as valid, even if you don\'t share it.', 'Say, "I hear you. I understand that you had a strong negative reaction."', 'This shows respect for their experience.'] }],
        ['Ask what you can do to make it right.', { title: 'Ask to Make Amends', steps: ['Ask, "Is there anything I can do to make this situation better?"', 'This shows you are willing to take action to repair the harm.', 'Be prepared to follow through.'] }],
        ['Reflect on your actions and their impact.', { title: 'Reflect on Your Actions', steps: ['Consider why your behavior had the impact it did.', 'Were you being insensitive or crossing a boundary?', 'Honest self-reflection is necessary for growth.'] }],
        ['Learn from the experience to be more considerate.', { title: 'Learn to be Considerate', steps: ['Make a commitment to be more mindful of others\' boundaries and sensitivities.', 'This experience can be a valuable lesson.', 'Turn a mistake into a learning opportunity.'] }],
        ['Work on rebuilding trust by being respectful of their boundaries.', { title: 'Rebuild Trust', steps: ['Consistently demonstrate respectful behavior over time.', 'Be mindful not to repeat the offending action.', 'Trust is rebuilt through consistent, trustworthy actions.'] }],
        
        // --- Trust ---
        // Self
        ['Acknowledge and appreciate the feeling of safety.', { title: 'Appreciate the Feeling', steps: ['Take a moment to notice the feeling of trust and safety in your body.', 'It often feels like a sense of calm or relaxation.', 'Appreciate this positive emotional state.'] }],
        ['Lean into the feeling.', { title: 'Lean Into It', steps: ['Allow yourself to fully experience the feeling of trust.', 'Don\'t second-guess it in the moment.', 'Enjoy the sense of security it provides.'] }],
        ['Express your trust to the person if appropriate.', { title: 'Express Your Trust', steps: ['If you feel comfortable, tell the person.', 'A simple "I really trust you" can be a powerful way to strengthen a bond.', 'It is a gift to the other person.'] }],
        ['Strengthen the bond by reciprocating trust.', { title: 'Reciprocate Trust', steps: ['Be trustworthy in return.', 'Share something about yourself.', 'This creates a cycle of mutual trust and openness.'] }],
        ['Collaborate on something together.', { title: 'Collaborate', steps: ['Working on a shared goal can be a great way to build on trust.', 'It puts your mutual reliability into action.', 'Choose a simple, low-stakes project.'] }],
        ['Enjoy the sense of connection and security.', { title: 'Enjoy the Connection', steps: ['Recognize that trust is the foundation of deep connection.', 'Appreciate the relationship that allows for this feeling.', 'Savor the emotional security it brings.'] }],
        ['Nurture the relationships where you feel trust.', { title: 'Nurture Trusting Relationships', steps: ['Invest your time and energy in people who make you feel safe.', 'These relationships are valuable assets for your well-being.', 'Don\'t take them for granted.'] }],
        ['Be a trustworthy person yourself.', { title: 'Be Trustworthy', steps: ['Act with integrity and keep your promises.', 'Be honest and reliable in your interactions.', 'The best way to have trustworthy people in your life is to be one.'] }],
        ['Understand that trust is built over time through consistent actions.', { title: 'Trust is Built Over Time', steps: ['Recognize that trust isn\'t instantaneous.', 'It is the result of many consistent, reliable actions.', 'Appreciate the history that led to this feeling.'] }],
        // Friend
        ['Be honored they trust you.', { title: 'Feel Honored', steps: ['Recognize that their trust is a gift.', 'Acknowledge the responsibility that comes with it.', 'Feel grateful for the strength of your friendship.'] }],
        ['Listen attentively.', { title: 'Listen Attentively', steps: ['Give them your undivided attention.', 'Show that you are taking what they say seriously.', 'Put away distractions and be fully present.'] }],
        ['Reassure them their trust is well-placed.', { title: 'Reassure Them', steps: ['Say something like, "Thank you for trusting me. I won\'t break that trust."', 'This verbal confirmation can be very comforting.', 'It reinforces their decision to confide in you.'] }],
        ['Keep their confidences.', { title: 'Keep Their Confidence', steps: ['This is the most important step.', 'Do not share what they told you with anyone else, unless there is a risk of harm.', 'Your discretion is essential.'] }],
        ['Be reliable and follow through on promises.', { title: 'Be Reliable', steps: ['Do what you say you will do.', 'This demonstrates your trustworthiness in action.', 'Consistency is key.'] }],
        ['Show you value their trust in you.', { title: 'Show You Value Their Trust', steps: ['Mention it from time to time: "I really value that you feel you can talk to me."', 'This acknowledges and reinforces the bond.', 'It shows you don\'t take it for granted.'] }],
        ['Be a consistently dependable friend.', { title: 'Be Dependable', steps: ['Show up for them in small ways and big ways.', 'Be a source of stable support in their life.', 'Your consistency is the bedrock of their trust.'] }],
        ['Communicate openly and honestly.', { title: 'Communicate Honestly', steps: ['Be truthful, even when it\'s difficult, but always with kindness.', 'Honest communication is a sign of respect.', 'This builds a foundation of authenticity.'] }],
        ['Support them and have their back.', { title: 'Have Their Back', steps: ['Stand up for them when it\'s needed.', 'Offer your support without being asked.', 'Show them that you are on their team.'] }],
        // Caused
        ['Acknowledge their trust with gratitude.', { title: 'Acknowledge with Gratitude', steps: ['Say, "Thank you for trusting me with this."', 'This shows that you recognize the value of what they are offering you.', 'It\'s a sign of respect.'] }],
        ['Feel good about being a reliable person.', { title: 'Feel Good About It', steps: ['Take a moment to appreciate this positive quality in yourself.', 'Being trustworthy is a wonderful character trait.', 'Allow yourself to feel a sense of quiet pride.'] }],
        ['Continue being dependable.', { title: 'Continue Being Dependable', steps: ['This positive feedback is a sign to keep doing what you\'re doing.', 'Maintain your habits of reliability and honesty.', 'Let it reinforce your positive behavior.'] }],
        ['Live up to the trust they\'ve placed in you.', { title: 'Live Up to the Trust', steps: ['Be extra mindful of your actions concerning them.', 'Make a conscious effort to not let them down.', 'Honor their vulnerability with your integrity.'] }],
        ['Don\'t take it for granted.', { title: 'Don\'t Take It for Granted', steps: ['Recognize that trust is precious and can be easily broken.', 'Treat it with the care it deserves.', 'Continue to earn it through your actions.'] }],
        ['Maintain open and honest communication.', { title: 'Maintain Open Communication', steps: ['Continue to be transparent in your dealings with them.', 'Check in and ask questions.', 'Good communication is the lifeblood of trust.'] }],
        ['Consistently act with integrity.', { title: 'Act with Integrity', steps: ['Align your actions with your values.', 'Be honest even when no one is watching.', 'Integrity is about being a trustworthy person from the inside out.'] }],
        ['Build a strong foundation for the relationship.', { title: 'Build a Strong Foundation', steps: ['See this moment of trust as a building block.', 'Continue to add more blocks through consistent, positive actions.', 'This creates a resilient and lasting bond.'] }],
        ['Cherish the role you play in making someone feel safe.', { title: 'Cherish Your Role', steps: ['Recognize that making someone feel safe is a profound gift.', 'It\'s one of the most important roles we can play in each other\'s lives.', 'Value this and take it seriously.'] }],
    ]);

    readonly strategies: WritableSignal<UserEmotionStrategies>;

    constructor() {
        this.strategies = signal<UserEmotionStrategies>(this.loadFromStorage());
        effect(() => {
            this.saveToStorage(this.strategies());
        });
    }

    private loadFromStorage(): UserEmotionStrategies {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (e) {
            console.error('Error loading strategies from localStorage', e);
        }
        return this.initializeDefaultStrategies();
    }
    
    private textToStrategy(text: string): Strategy {
        const details = this.strategyDetailsMap.get(text);
        
        let title = text;
        let steps: Step[];
        let toolId: 'grounding' | undefined = undefined;

        if (details) {
            title = details.title;
            steps = details.steps.map(stepText => ({
                id: crypto.randomUUID(),
                text: stepText
            }));
            toolId = details.toolId;
        } else {
            // Fallback for any strategy not in the map, though all defaults should now be covered.
            console.warn(`Strategy not found in map: "${text}". Using default steps.`);
            steps = [{ id: crypto.randomUUID(), text: 'Break this down into a small, actionable step.' }];
        }
        
        return {
            id: crypto.randomUUID(),
            title: title,
            steps: steps,
            toolId: toolId
        };
    }

    private initializeDefaultStrategies(): UserEmotionStrategies {
        const defaultEmotions = this.emotionService.getEmotions();
        const initialStrategies: UserEmotionStrategies = {};

        for (const emotion of defaultEmotions) {
            initialStrategies[emotion.name] = {
                self: {
                    immediate: emotion.scenarios.self.immediate.map(text => this.textToStrategy(text)),
                    shortTerm: emotion.scenarios.self.shortTerm.map(text => this.textToStrategy(text)),
                    longTerm: emotion.scenarios.self.longTerm.map(text => this.textToStrategy(text)),
                },
                friend: {
                    immediate: emotion.scenarios.friend.immediate.map(text => this.textToStrategy(text)),
                    shortTerm: emotion.scenarios.friend.shortTerm.map(text => this.textToStrategy(text)),
                    longTerm: emotion.scenarios.friend.longTerm.map(text => this.textToStrategy(text)),
                },
                caused: {
                    immediate: emotion.scenarios.caused.immediate.map(text => this.textToStrategy(text)),
                    shortTerm: emotion.scenarios.caused.shortTerm.map(text => this.textToStrategy(text)),
                    longTerm: emotion.scenarios.caused.longTerm.map(text => this.textToStrategy(text)),
                }
            };
        }
        return initialStrategies;
    }

    private saveToStorage(strategies: UserEmotionStrategies): void {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(strategies));
        } catch (e) {
            console.error('Error saving strategies to localStorage', e);
        }
    }

    resetToDefaults(): void {
        try {
            localStorage.removeItem(this.storageKey);
        } catch (e) {
            console.error('Error removing strategies from localStorage', e);
        }
        this.strategies.set(this.initializeDefaultStrategies());
    }

    private updateStrategyList(emotion: string, scenario: string, category: string, updateFn: (list: Strategy[]) => Strategy[]) {
        this.strategies.update(allStrategies => {
            const newStrategies = JSON.parse(JSON.stringify(allStrategies));
            const emotionStrategies = newStrategies[emotion];
            
            if (emotionStrategies && emotionStrategies[scenario] && emotionStrategies[scenario][category]) {
                const currentList = emotionStrategies[scenario][category];
                emotionStrategies[scenario][category] = updateFn(currentList);
            }
            
            return newStrategies;
        });
    }

    addStrategy(emotion: string, scenario: 'self' | 'friend' | 'caused', category: 'immediate' | 'shortTerm' | 'longTerm'): void {
        const newStrategy: Strategy = { 
            id: crypto.randomUUID(), 
            title: 'New Strategy...',
            steps: [{ id: crypto.randomUUID(), text: 'First step...' }]
        };
        this.updateStrategyList(emotion, scenario, category, list => [...list, newStrategy]);
    }
    
    deleteStrategy(emotion: string, scenario: 'self' | 'friend' | 'caused', category: 'immediate' | 'shortTerm' | 'longTerm', strategyId: string): void {
        this.updateStrategyList(emotion, scenario, category, list => list.filter(s => s.id !== strategyId));
    }

    updateStrategyTitle(emotion: string, scenario: 'self' | 'friend' | 'caused', category: 'immediate' | 'shortTerm' | 'longTerm', strategyId: string, newTitle: string): void {
        this.updateStrategyList(emotion, scenario, category, list => list.map(s => s.id === strategyId ? { ...s, title: newTitle } : s));
    }

    addStep(emotion: string, scenario: 'self' | 'friend' | 'caused', category: 'immediate' | 'shortTerm' | 'longTerm', strategyId: string): void {
        const newStep: Step = { id: crypto.randomUUID(), text: 'New step...' };
        this.updateStrategyList(emotion, scenario, category, list => 
            list.map(s => s.id === strategyId ? { ...s, steps: [...s.steps, newStep] } : s)
        );
    }
    
    deleteStep(emotion: string, scenario: 'self' | 'friend' | 'caused', category: 'immediate' | 'shortTerm' | 'longTerm', strategyId: string, stepId: string): void {
        this.updateStrategyList(emotion, scenario, category, list => 
            list.map(s => s.id === strategyId ? { ...s, steps: s.steps.filter(step => step.id !== stepId) } : s)
        );
    }

    updateStepText(emotion: string, scenario: 'self' | 'friend' | 'caused', category: 'immediate' | 'shortTerm' | 'longTerm', strategyId: string, stepId: string, newText: string): void {
        this.updateStrategyList(emotion, scenario, category, list => 
            list.map(s => s.id === strategyId 
              ? { ...s, steps: s.steps.map(step => step.id === stepId ? { ...step, text: newText } : step) } 
              : s
            )
        );
    }
    
    reorderStrategies(emotion: string, scenario: 'self' | 'friend' | 'caused', category: 'immediate' | 'shortTerm' | 'longTerm', updatedList: Strategy[]): void {
        this.updateStrategyList(emotion, scenario, category, () => updatedList);
    }
}