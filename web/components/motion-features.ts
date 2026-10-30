// The animation features Framer Motion needs, split out so they load in their
// own chunk after the page has painted. Content never waits on this file.
import { domAnimation } from 'framer-motion';

export default domAnimation;
