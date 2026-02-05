import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Call the gift-profile API internally
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  try {
    const response = await fetch(`${baseUrl}/api/analytics/gift-profile/330`);
    const data = await response.json();

    // Extract critical fields
    const result = {
      hasProfile: !!data.profile,
      hasClaimer: !!data.profile?.claimer,
      claimerValue: data.profile?.claimer || 'NOT FOUND',
      hasClaimObject: !!data.profile?.claim,
      claimClaimerWallet: data.profile?.claim?.claimerWallet || 'NOT IN CLAIM',
      hasEducation: !!data.profile?.education,
      educationEmail: data.profile?.education?.email || 'NO EMAIL',

      // Debug: show all top-level keys
      topLevelKeys: data.profile ? Object.keys(data.profile) : [],

      // Show claim object keys if exists
      claimKeys: data.profile?.claim ? Object.keys(data.profile.claim) : []
    };

    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(500).json({
      error: 'Failed to test',
      message: error.message
    });
  }
}