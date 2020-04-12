import React from 'react';

export {HotNews};

function HotNews() {
  return <div className="more_panel_block">
    <div className="more_panel_block_title">
      News
    </div>
    <Date>April, 12th</Date>
    <ul>
      <li>Themes super-powered &mdash; you can now create, save, and share Themes.</li>
      <li>New zooming algorithm for a more robust zooming.</li>
      <li>Lower CPU and RAM memory footprint.</li>
    </ul>
    <Date>March, 16th</Date>
    <ul>
      <li>New YouTube loader for a more robust YouTube alarm.</li>
      <li>Fallback alarm-sound when offline. </li>
    </ul>
    If you encounter any issue with these new features then <a href="/bug-repair">let me know</a>.
  </div>;
}

function Date({children}) {
  return <div style={{marginTop: 11, marginBottom: -11}}>{children}</div>
}