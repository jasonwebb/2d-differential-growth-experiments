# 04 - SVG as input

This experiment applies the differential growth process to paths that are brought in through an external SVG file.

# Preparing SVGs for input

- Set up Inkscape to [use absolute coordinates](http://www.inkscapeforum.com/viewtopic.php?t=11228) for SVGs.
- Convert all objects to paths by selecting everything and using **Path > Object to Path**.
- *(Optional)* Ungroup all paths fro simplicity by selecting everything and using **Object > Ungroup**.
- Convert all segments to lines by using the **Edit paths by node** tool to select all nodes in all paths and clicking the icon for **Make selected segments lines**.
- Resize canvas to fit content by going to the Document Properties, expanding the section for _Resize page to content..._ under _Custom size_ and click the **Resize page to drawing or selection** button.
- Save as an SVG.

# Samples

![Hello world starting point](images/04-hello-world-start.png)

![Hello world text after 3s](images/04-hello-world-after-3s.png)

![Hello world text after 10s](images/04-hello-world-after-10s.png)

![Hello world growth process](images/04-hello-world-growth-process.gif)

![Superformula growth process inverted](images/04-superformula-growth-process-inverted.gif)