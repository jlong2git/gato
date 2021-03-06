[#assign title = ctx.request.getAttribute("safeTitle")]

[#assign formHasSenderEmail = ctx.request.getAttribute("formHasSenderEmail")!false]
[#assign formHasSenderName = ctx.request.getAttribute("formHasSenderName")!false]
[#assign inputType = "text"]
[#assign dataType = content.dataType!]

[#if (content.senderInfo!"") == "email"]
  [#assign dataType = "email"]
  [#if !formHasSenderEmail]
    [#assign title = "SenderEmail"]
    [#assign inputType = "email"]
    ${ctx.request.setAttribute("formHasSenderEmail", true)}
  [/#if]
[/#if]

[#if (content.senderInfo!"") == "name" && !formHasSenderName]
  [#assign title = "SenderName"]
  ${ctx.request.setAttribute("formHasSenderName", true)}
[/#if]

<div class="formelement">
[#if (content.title!"")?has_content || content.mandatory!false]
  <label for="${title}" class="txst-form-text-label">
    ${cmsfn.decode(content).title!}
    [#if content.mandatory!false]*[/#if]
  </label>
[/#if]
[#if content.mandatory!false]
  <input type="hidden" name="mgnlMandatory" value="${title}" />
[/#if]

[#if content.lines == "single"]
  [#assign inputSize = "60"]
  [#assign validating = true]
  [#switch dataType]
    [#case "netid"]
    [#case "zip"]
      [#assign inputSize = "8"]
      [#break]
    [#case "anumber"]
      [#assign inputSize = "10"]
      [#break]
    [#case "date"]
    [#case "integer"]
    [#case "decimal"]
      [#assign inputSize = "12"]
      [#break]
    [#case "phone"]
      [#assign inputSize = "15"]
      [#break]
    [#case "keystring"]
      [#assign inputSize = "20"]
      [#break]
    [#case "regex"]
    [#case "email"]
    [#case "txemail"]
      [#assign inputSize = "50"]
      [#break]
    [#default]
      [#assign validating = false]
  [/#switch]
  <input type="${inputType}" id="${title}" name="${title}" class="text" size="${inputSize}" [#if content.mandatory!false]aria-required="true"[/#if] aria-invalid="false" aria-describedby="${title}-error"/>

  [#if (content.dataType!"") == "date"]
    <script type="text/javascript">
      $('${title}').valid_fromDate = '${content.datefrom!""}';
      $('${title}').valid_toDate = '${content.dateto!""}';
    </script>
  [/#if]

  [#if (content.dataType!"") == "regex"]
    [#assign regex = (content.regexregex!"")?replace("\\", "\\\\")]
    [#assign regex = regex?replace("'", "\\\'")]
    [#assign message = (content.regexerror!"")?replace("'", "\\\'")]
    <script type="text/javascript">
      $('${title}').valid_regex = '${regex}';
      $('${title}').valid_msg = '${message}';
    </script>
  [/#if]
  [#if validating]
    <span class="valid-icon-cont">
      <div class="txst-form-validicon txst-form-${content.dataType!}" id="${title}-error" role="alert">&nbsp;</div>
    </span>
  [/#if]
[#elseif content.lines == "small"]
  <textarea name=${title} id=${title} rows="4" cols="60"></textarea>
[#else]
  <textarea name=${title} id=${title} rows="10" cols="60"></textarea>
[/#if]
</div>
