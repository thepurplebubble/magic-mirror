export let hcmirrorTest = "C069N64PW4A";
export let pbmirrorTest = "C07ASSJGE2G"; // ~~~~~~~~~~~~~~~~

export let hcTeam = "T0266FRGM";
let hcChannel_purplebubble = "C068D2P46TH";
let hcChannel_pbip = "C06AXC7B0QN";
let hcChannel_pbDesign = "C07B2MTHCDU";

export let pbTeam = "T07986PHP2R";
let pbChannel_pb = "C079B7H3AKD";
let pbChannel_pbpb = "C078WH9B44F";
let pbChannel_design = "C07B617MLU9";
export const enabledChannels = [
  hcmirrorTest,
  pbmirrorTest,
  // ~~~~~~~~~~~~~~~
  // hcChannel_pbip,
  // hcChannel_purplebubble,
  // hcChannel_pbDesign,
  // pbChannel_pb,
  // pbChannel_pbpb,
  // pbChannel_design,
];

export const channelMap = {
  [pbmirrorTest]: hcmirrorTest,
  [hcmirrorTest]: pbmirrorTest,

  [pbChannel_pb]: hcChannel_purplebubble,
  [hcChannel_purplebubble]: pbChannel_pb,

  [pbChannel_pbpb]: hcChannel_pbip,
  [hcChannel_pbip]: pbChannel_pbpb,

  [pbChannel_design]: hcChannel_pbDesign,
  [hcChannel_pbDesign]: pbChannel_design,
};
