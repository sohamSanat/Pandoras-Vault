<%"---"%>
<%*
tR += await tp.file.include("[[Note Banner Config]]"); 
%>
<%* tR+= "cssclasses:"%>
  - <%"image-borders"%>
  - image-small

date: <% tp.file.creation_date("YYYY-MM-DD") %>
tags:
  - "#type/note"
<%"---"%>
# ✧ <% tp.file.title %>

---

**Links:** 

---

<% tp.file.selection() %>