'use server';
/**
 * @fileOverview A secure backend flow to add a user to a team.
 *
 * - addMemberToTeam - A function that handles adding a user to a team.
 * - AddMemberInput - The input type for the addMemberToTeam function.
 * - AddMemberOutput - The return type for the addMemberToTeam function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { db } from '@/lib/firebase';
import { collection, doc, getDoc, getDocs, query, runTransaction, where } from 'firebase/firestore';

export const AddMemberInputSchema = z.object({
  teamId: z.string().describe('The ID of the team to join.'),
  userId: z.string().describe('The ID of the user joining the team.'),
});
export type AddMemberInput = z.infer<typeof AddMemberInputSchema>;

export const AddMemberOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  teamName: z.string().optional(),
});
export type AddMemberOutput = z.infer<typeof AddMemberOutputSchema>;


export async function addMemberToTeam(input: AddMemberInput): Promise<AddMemberOutput> {
  return addMemberToTeamFlow(input);
}


const addMemberToTeamFlow = ai.defineFlow(
  {
    name: 'addMemberToTeamFlow',
    inputSchema: AddMemberInputSchema,
    outputSchema: AddMemberOutputSchema,
  },
  async ({ teamId, userId }) => {
    try {
        const teamName = await runTransaction(db, async (transaction) => {
            const teamRef = doc(db, 'teams', teamId);
            const userRef = doc(db, 'users', userId);

            const teamDoc = await transaction.get(teamRef);
            if (!teamDoc.exists()) {
                throw new Error('Team not found. The invitation link may be invalid.');
            }

            const userDoc = await transaction.get(userRef);
            if (!userDoc.exists()) {
                throw new Error('User performing the action not found.');
            }
            if (userDoc.data().teamId) {
                throw new Error('You are already a member of a team.');
            }

            // Query for members inside the transaction to ensure atomicity
            const membersQuery = query(collection(db, "users"), where("teamId", "==", teamId));
            const membersSnapshot = await getDocs(membersQuery);
            
            if (membersSnapshot.size >= 4) {
                throw new Error('This team is already full and cannot accept new members.');
            }

            transaction.update(userRef, { teamId: teamId });
            return teamDoc.data().teamName;
        });
        
        return {
            success: true,
            message: `Successfully joined team!`,
            teamName: teamName,
        };

    } catch (error: any) {
        console.error("Error in addMemberToTeamFlow: ", error);
        return {
            success: false,
            message: error.message || 'An unexpected error occurred while trying to join the team.',
        };
    }
  }
);
