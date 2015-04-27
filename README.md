# WipEout (PSX) Model Viewer

Source code for the [WipEout Model Viewer](http://phoboslab.org/wipeout/).

This repository does not contain the actual WipEout data files. You have to copy the `WIPEOUT/` directory from the original CD.

More info in my blog: http://phoboslab.org/log/2015/04/reverse-engineering-wipeout-psx


MIT License


### Known Problems

 - Two unknown polygon types that are currently ignored: 0x00 (possibly padding?) and 0x0A which might be sprite-like - alpha texture, non rotated. The squiggly lights in the jump pits on Karbonis are missing; could be 0x0A?!.
 
 - The underside of the ships for WipEout have the wrong textures or UV coordinates
 
 - Fly-through Camera spline doesn't handle jumps nicely
 
 - Some faces from PRM models seem to be backwards. This only is a problem for some WOXL models. E.g. the cannopy on Spilskinake or some rocks on Vostock Island are backwards. Maybe this just didn't matter, because the original game didn't cull back faces? Or is there a flag or face normal for some polygon types?
 