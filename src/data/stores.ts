import { readable } from "svelte/store";

import { newRandomID } from "$scripts/utils";

export const myID = readable(newRandomID());