[#assign decodedContent = cmsfn.decode(content)]
<div class="gato-textimage eq-parent">
  [#-- if there is a title, put it here --]
  [#if (content.title)?has_content]
    <h2 class="gato-textimage-title">
      ${content.title}
    </h2>
  [/#if]
  [#if (content.image)?has_content]
    <div class="gato-textimage-imageblock ${content.imageFloat} eq-mn-1-1 eq-md-1-2 eq-lg-1-3">
      <img src="${gf.getImgDefault(content.image)}" sizes="400px" alt="${content.imageAlt!}" srcset="${gf.getSrcSet(content.image)}" />
      [#if (content.imageCaption)?has_content]
        <div class="gato-textimage-caption">${decodedContent.imageCaption}</div>
      [/#if]
    </div>
  [/#if]
  ${gf.processRichText(decodedContent.text)}
</div>
