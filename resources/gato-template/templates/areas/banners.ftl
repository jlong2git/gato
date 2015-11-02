[#if component??]
  [@cms.component content=component/]
[#else]
  [#list cmsfn.ancestors(cmsfn.page(content))! as ancestor]
    [#assign banner = gf.singleComponent(ancestor, 'gato-banners')]
    [#if banner??]
      [#assign content=banner]
      [#include "/gato-template/templates/components/banners.ftl"]
      [#break]
    [/#if]
  [/#list]
[/#if]
<div cms:add="bar"></div>